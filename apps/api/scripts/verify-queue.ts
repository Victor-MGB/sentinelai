import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { loadEnv } from '../src/config/env.js';
import { createDatabase } from '../src/infrastructure/database/client.js';
import { jobRuns } from '../src/infrastructure/database/schema.js';
import { createRedisConnection } from '../src/infrastructure/queue/connection.js';
import { closeQueues, createQueues } from '../src/infrastructure/queue/queues.js';
import { createSampleWorker } from '../src/infrastructure/queue/sample-worker.js';
import { JobsRepository } from '../src/modules/jobs/jobs.repository.js';
import { createLogger } from '../src/shared/logging/logger.js';

const config = loadEnv();
const logger = createLogger(config);
const database = createDatabase(config);
const queueConnection = createRedisConnection(config);
const workerConnection = createRedisConnection(config, { blocking: true });

await queueConnection.connect();
await workerConnection.connect();

const queues = createQueues(queueConnection, config);
const worker = createSampleWorker({
  config,
  connection: workerConnection,
  database: database.db,
  queues,
  logger,
});
const repository = new JobsRepository(database.db);

const successJobId = `job_${randomUUID().replaceAll('-', '')}`;
const failureJobId = `job_${randomUUID().replaceAll('-', '')}`;

try {
  await repository.create({
    id: `jrun_${randomUUID().replaceAll('-', '')}`,
    queue: queues.sample.name,
    jobName: 'sample',
    jobId: successJobId,
    payload: {
      type: 'system.sample',
      orgId: 'org_queue_check',
      message: 'Queue verification',
    },
  });
  await repository.create({
    id: `jrun_${randomUUID().replaceAll('-', '')}`,
    queue: queues.sample.name,
    jobName: 'sample',
    jobId: failureJobId,
    payload: {
      type: 'system.sample',
      orgId: 'org_queue_check',
      message: 'Queue failure verification',
      shouldFail: true,
    },
  });

  await queues.sample.add(
    'sample',
    {
      type: 'system.sample',
      orgId: 'org_queue_check',
      message: 'Queue verification',
      shouldFail: false,
      requestId: 'verify-queue',
    },
    { jobId: successJobId },
  );

  await queues.sample.add(
    'sample',
    {
      type: 'system.sample',
      orgId: 'org_queue_check',
      message: 'Queue failure verification',
      shouldFail: true,
      requestId: 'verify-queue',
    },
    { jobId: failureJobId },
  );

  const success = await waitForStatus(repository, successJobId, 'completed', 15000);
  const failure = await waitForStatus(repository, failureJobId, 'failed', 20000);
  const deadLetter = await queues.sampleDlq.getJob(`dlq_${failureJobId}`);

  if (!success.result || success.result.message !== 'Queue verification') {
    throw new Error('Completed job did not persist the expected result.');
  }

  if (!failure.error) {
    throw new Error('Failed job did not persist an error reason.');
  }

  if (!deadLetter) {
    throw new Error('Failed job was not moved to the dead-letter queue.');
  }

  console.log(`Queue processing verified for ${successJobId}.`);
  console.log(`Retry and dead-letter handling verified for ${failureJobId}.`);
} catch (error) {
  console.error(
    `Queue verification failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await database.db
    .delete(jobRuns)
    .where(eq(jobRuns.jobId, successJobId))
    .catch(() => undefined);
  await database.db
    .delete(jobRuns)
    .where(eq(jobRuns.jobId, failureJobId))
    .catch(() => undefined);

  await worker.close();
  await closeQueues(queues);
  await Promise.all([
    queueConnection.quit().catch(() => queueConnection.disconnect()),
    workerConnection.quit().catch(() => workerConnection.disconnect()),
  ]);
  await database.close();
}

async function waitForStatus(
  repository: JobsRepository,
  jobId: string,
  status: string,
  timeoutMs: number,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await repository.findByJobId(jobId);

    if (job?.status === status) {
      return job;
    }

    await delay(100);
  }

  throw new Error(`Timed out waiting for job ${jobId} to reach status ${status}.`);
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
