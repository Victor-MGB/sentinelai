import { Worker, type Job } from 'bullmq';
import type { Redis } from 'ioredis';
import type { Logger } from 'pino';

import type { AppConfig } from '../../config/env.js';
import type { Database } from '../database/client.js';
import { JobsRepository } from '../../modules/jobs/jobs.repository.js';
import {
  sampleJobPayloadSchema,
  type DeadLetterPayload,
  type SampleJobPayload,
  type SampleJobResult,
} from './job-schemas.js';
import { SAMPLE_QUEUE_NAME, type QueueRegistry } from './queues.js';

export interface SampleWorkerOptions {
  config: AppConfig;
  connection: Redis;
  database: Database;
  queues: QueueRegistry;
  logger: Logger;
}

export function createSampleWorker(
  options: SampleWorkerOptions,
): Worker<SampleJobPayload, SampleJobResult> {
  const repository = new JobsRepository(options.database);

  const worker = new Worker<SampleJobPayload, SampleJobResult>(
    SAMPLE_QUEUE_NAME,
    async (job) => {
      const payload = sampleJobPayloadSchema.parse(job.data);
      const jobId = job.id ?? '';
      const attempt = job.attemptsMade + 1;

      await repository.markActive(jobId, attempt);

      if (payload.shouldFail) {
        throw new Error('Sample job was configured to fail.');
      }

      await job.updateProgress(100);

      const result: SampleJobResult = {
        message: payload.message,
        processedAt: new Date().toISOString(),
        attempt,
      };

      await repository.markCompleted(jobId, result, attempt);
      return result;
    },
    {
      connection: options.connection,
      prefix: options.config.QUEUE_PREFIX,
      concurrency: options.config.QUEUE_CONCURRENCY,
      removeOnComplete: {
        age: 24 * 60 * 60,
        count: 1000,
      },
    },
  );

  worker.on('completed', (job) => {
    options.logger.info(
      {
        jobId: job.id,
        queue: SAMPLE_QUEUE_NAME,
        jobName: job.name,
      },
      'job.completed',
    );
  });

  worker.on('failed', (job, error) => {
    void handleFailedJob(job, error, repository, options).catch((handlerError: unknown) => {
      options.logger.error(
        {
          err: handlerError,
          jobId: job?.id,
          queue: SAMPLE_QUEUE_NAME,
        },
        'job.failure_handler_failed',
      );
    });
  });

  worker.on('error', (error) => {
    options.logger.error({ err: error, queue: SAMPLE_QUEUE_NAME }, 'worker.error');
  });

  return worker;
}

async function handleFailedJob(
  job: Job<SampleJobPayload, SampleJobResult> | undefined,
  error: Error,
  repository: JobsRepository,
  options: SampleWorkerOptions,
): Promise<void> {
  if (!job?.id) {
    return;
  }

  const attempts = job.attemptsMade;
  const maxAttempts = job.opts.attempts ?? 1;
  const failedReason = error.message;

  if (attempts < maxAttempts) {
    await repository.markRetrying(job.id, attempts, failedReason);

    options.logger.warn(
      {
        jobId: job.id,
        queue: SAMPLE_QUEUE_NAME,
        attempts,
        maxAttempts,
        err: error,
      },
      'job.retrying',
    );

    return;
  }

  await repository.markFailed(job.id, failedReason, attempts);

  const deadLetter: DeadLetterPayload = {
    sourceQueue: SAMPLE_QUEUE_NAME,
    jobId: job.id,
    jobName: job.name,
    payload: job.data,
    failedReason,
    attemptsMade: attempts,
    failedAt: new Date().toISOString(),
  };

  await options.queues.sampleDlq.add('dead-letter', deadLetter, {
    jobId: `dlq_${job.id}`,
  });

  options.logger.error(
    {
      jobId: job.id,
      queue: SAMPLE_QUEUE_NAME,
      deadLetterQueue: options.queues.sampleDlq.name,
      attempts,
      err: error,
    },
    'job.dead_lettered',
  );
}
