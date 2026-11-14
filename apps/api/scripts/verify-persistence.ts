import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { loadEnv } from '../src/config/env.js';
import { createDatabase, withTransaction } from '../src/infrastructure/database/client.js';
import { jobRuns } from '../src/infrastructure/database/schema.js';
import { JobsRepository } from '../src/modules/jobs/jobs.repository.js';

const config = loadEnv();
const database = createDatabase(config);
const jobId = `job_${randomUUID().replaceAll('-', '')}`;
const jobRunId = `jrun_${randomUUID().replaceAll('-', '')}`;

try {
  await withTransaction(database.db, async (transaction) => {
    await new JobsRepository(transaction).create({
      id: jobRunId,
      queue: 'system.sample',
      jobName: 'persistence-check',
      jobId,
      payload: {
        type: 'system.sample',
        orgId: 'org_persistence_check',
        message: 'Persistence verification',
      },
    });
  });

  const repository = new JobsRepository(database.db);
  const created = await repository.findByJobId(jobId);

  if (!created || created.status !== 'queued') {
    throw new Error('Job run was not persisted after the create transaction.');
  }

  await withTransaction(database.db, async (transaction) => {
    await new JobsRepository(transaction).markCompleted(
      jobId,
      {
        message: 'Persistence verification complete.',
      },
      1,
    );
  });

  const completed = await repository.findByJobId(jobId);

  if (!completed || completed.status !== 'completed') {
    throw new Error('Job run update was not persisted.');
  }

  await database.db.delete(jobRuns).where(eq(jobRuns.jobId, jobId));

  console.log(`PostgreSQL persistence verified for job ${jobId}.`);
} catch (error) {
  console.error(
    `PostgreSQL persistence verification failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
} finally {
  await database.close();
}
