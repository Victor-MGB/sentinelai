import { randomUUID } from 'node:crypto';

import type { Queue } from 'bullmq';
import { z } from 'zod';

import type { JobRunRow } from '../../infrastructure/database/schema.js';
import { SAMPLE_QUEUE_NAME, type QueueRegistry } from '../../infrastructure/queue/queues.js';
import type { SampleJobPayload } from '../../infrastructure/queue/job-schemas.js';
import { dependencyUnavailableError, notFoundError } from '../../shared/errors/app-error.js';
import type { JobsRepository } from './jobs.repository.js';

export const enqueueSampleJobSchema = z
  .object({
    orgId: z.string().min(1).max(64),
    message: z.string().trim().min(1).max(500).default('Hello from SentinelAI'),
    shouldFail: z.boolean().default(false),
  })
  .strict();

export type EnqueueSampleJobInput = z.infer<typeof enqueueSampleJobSchema>;

export const jobParamsSchema = z
  .object({
    jobId: z.string().regex(/^job_[0-9a-f]{32}$/, 'Must be a valid job identifier.'),
  })
  .strict();

export interface EnqueuedJob {
  jobId: string;
  status: 'queued';
}

export class JobsService {
  constructor(
    private readonly repository: JobsRepository,
    private readonly queues: QueueRegistry,
  ) {}

  async enqueueSample(input: EnqueueSampleJobInput, requestId: string): Promise<EnqueuedJob> {
    const jobId = `job_${randomUUID().replaceAll('-', '')}`;
    const payload: SampleJobPayload = {
      type: 'system.sample',
      orgId: input.orgId,
      message: input.message,
      shouldFail: input.shouldFail,
      requestId,
    };

    await this.repository.create({
      id: `jrun_${randomUUID().replaceAll('-', '')}`,
      queue: SAMPLE_QUEUE_NAME,
      jobName: 'sample',
      jobId,
      payload,
    });

    try {
      await this.addSampleJob(jobId, payload);
    } catch (error) {
      await this.repository.markFailed(jobId, errorMessage(error), 0);
      throw dependencyUnavailableError('The job queue is unavailable. Retry the request.');
    }

    return {
      jobId,
      status: 'queued',
    };
  }

  async getJob(jobId: string): Promise<JobRunRow> {
    const job = await this.repository.findByJobId(jobId);

    if (!job) {
      throw notFoundError('The requested job was not found.');
    }

    return job;
  }

  private async addSampleJob(jobId: string, payload: SampleJobPayload): Promise<void> {
    const queue: Queue<SampleJobPayload> = this.queues.sample;
    await queue.add('sample', payload, { jobId });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
