import { fileURLToPath } from 'node:url';

import { inArray } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import type { Database } from '../../src/infrastructure/database/client.js';
import { jobRuns } from '../../src/infrastructure/database/schema.js';

const migrationsFolder = fileURLToPath(new URL('../../drizzle', import.meta.url));

export async function applyMigrations(db: Database): Promise<void> {
  await migrate(db, { migrationsFolder });
}

export async function cleanupJobRuns(db: Database, jobIds: string[]): Promise<void> {
  if (jobIds.length === 0) {
    return;
  }

  await db.delete(jobRuns).where(inArray(jobRuns.jobId, jobIds));
}
