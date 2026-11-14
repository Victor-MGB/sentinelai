import { eq } from 'drizzle-orm';

import type { DatabaseExecutor } from '../../infrastructure/database/client.js';
import {
  jobRuns,
  type JobRunRow,
  type NewJobRunRow,
} from '../../infrastructure/database/schema.js';

export type JobRunStatus = 'queued' | 'active' | 'retrying' | 'completed' | 'failed';

export interface CreateJobRunInput {
  id: string;
  queue: string;
  jobName: string;
  jobId: string;
  payload: Record<string, unknown>;
}

export class JobsRepository {
  constructor(private readonly db: DatabaseExecutor) {}

  async create(input: CreateJobRunInput): Promise<JobRunRow> {
    const values: NewJobRunRow = {
      id: input.id,
      queue: input.queue,
      jobName: input.jobName,
      jobId: input.jobId,
      status: 'queued',
      payload: input.payload,
    };

    const [row] = await this.db.insert(jobRuns).values(values).returning();

    if (!row) {
      throw new Error('Failed to create job run.');
    }

    return row;
  }

  async findByJobId(jobId: string): Promise<JobRunRow | null> {
    const [row] = await this.db.select().from(jobRuns).where(eq(jobRuns.jobId, jobId)).limit(1);

    return row ?? null;
  }

  async markActive(jobId: string, attempts: number): Promise<void> {
    await this.db
      .update(jobRuns)
      .set({
        status: 'active',
        attempts,
        startedAt: new Date(),
        updatedAt: new Date(),
        error: null,
      })
      .where(eq(jobRuns.jobId, jobId));
  }

  async markRetrying(jobId: string, attempts: number, error: string): Promise<void> {
    await this.db
      .update(jobRuns)
      .set({
        status: 'retrying',
        attempts,
        error,
        updatedAt: new Date(),
      })
      .where(eq(jobRuns.jobId, jobId));
  }

  async markCompleted(
    jobId: string,
    result: Record<string, unknown>,
    attempts: number,
  ): Promise<void> {
    await this.db
      .update(jobRuns)
      .set({
        status: 'completed',
        result,
        attempts,
        finishedAt: new Date(),
        updatedAt: new Date(),
        error: null,
      })
      .where(eq(jobRuns.jobId, jobId));
  }

  async markFailed(jobId: string, error: string, attempts: number): Promise<void> {
    await this.db
      .update(jobRuns)
      .set({
        status: 'failed',
        error,
        attempts,
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobRuns.jobId, jobId));
  }
}
