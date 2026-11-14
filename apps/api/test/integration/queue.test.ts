import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import type { JobRunRow } from '../../src/infrastructure/database/schema.js';
import { JobsRepository } from '../../src/modules/jobs/jobs.repository.js';
import { buildTestApp, type TestApp } from '../fixtures/app.js';
import { applyMigrations, cleanupJobRuns } from '../fixtures/database.js';
import { startTestWorker, type TestWorker } from '../fixtures/worker.js';

let app: TestApp;
let testWorker: TestWorker;
let repository: JobsRepository;
const jobIds: string[] = [];

beforeAll(async () => {
  app = await buildTestApp();
  await applyMigrations(app.db);
  repository = new JobsRepository(app.db);
  testWorker = await startTestWorker(app);
});

afterAll(async () => {
  await cleanupJobRuns(app.db, jobIds);

  for (const jobId of jobIds) {
    await app.queues.sample.remove(jobId).catch(() => undefined);
    await app.queues.sampleDlq.remove(`dlq_${jobId}`).catch(() => undefined);
  }

  await testWorker.close();
  await app.close();
});

describe('background queue processing', () => {
  it('processes an enqueued sample job and persists its result', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/sample',
      payload: {
        orgId: 'org_queue_test',
        message: 'Queue integration test',
      },
    });

    expect(response.statusCode).toBe(202);

    const { jobId } = response.json<{ data: { jobId: string } }>().data;
    jobIds.push(jobId);

    const job = await waitForStatus(repository, jobId, 'completed', 15_000);

    expect(job.attempts).toBe(1);
    expect(job.result).toMatchObject({
      message: 'Queue integration test',
      attempt: 1,
    });
  });

  it('retries a failing job and moves it to the dead-letter queue', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/sample',
      payload: {
        orgId: 'org_queue_test',
        message: 'Queue failure integration test',
        shouldFail: true,
      },
    });

    expect(response.statusCode).toBe(202);

    const { jobId } = response.json<{ data: { jobId: string } }>().data;
    jobIds.push(jobId);

    const job = await waitForStatus(repository, jobId, 'failed', 25_000);

    expect(job.attempts).toBe(3);
    expect(job.error).toContain('configured to fail');

    const deadLetter = await app.queues.sampleDlq.getJob(`dlq_${jobId}`);

    expect(deadLetter).not.toBeNull();
    expect(deadLetter?.data).toMatchObject({
      sourceQueue: 'system.sample',
      jobId,
      failedReason: expect.stringContaining('configured to fail'),
      attemptsMade: 3,
    });
  });

  it('reports persisted job status through the API', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/sample',
      payload: {
        orgId: 'org_queue_test',
        message: 'Status endpoint test',
      },
    });

    const { jobId } = response.json<{ data: { jobId: string } }>().data;
    jobIds.push(jobId);

    await waitForStatus(repository, jobId, 'completed', 15_000);

    const statusResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/jobs/${jobId}`,
    });

    expect(statusResponse.statusCode).toBe(200);
    expect(statusResponse.json()).toMatchObject({
      data: {
        jobId,
        status: 'completed',
        attempts: 1,
      },
    });
  });
});

async function waitForStatus(
  jobsRepository: JobsRepository,
  jobId: string,
  status: string,
  timeoutMs: number,
): Promise<JobRunRow> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const job = await jobsRepository.findByJobId(jobId);

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
