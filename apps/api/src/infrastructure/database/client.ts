import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import type { AppConfig } from '../../config/env.js';
import * as schema from './schema.js';

export type Database = NodePgDatabase<typeof schema>;
export type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0];
export type DatabaseExecutor = Database | Transaction;

export interface DatabaseConnection {
  pool: Pool;
  db: Database;
  close: () => Promise<void>;
}

export function createDatabase(config: AppConfig): DatabaseConnection {
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: config.DATABASE_POOL_MAX,
    application_name: 'sentinelai-api',
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

  const db = drizzle({ client: pool, schema });

  return {
    pool,
    db,
    close: async () => {
      await pool.end();
    },
  };
}

export async function withTransaction<T>(
  db: Database,
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (transaction) => callback(transaction));
}
