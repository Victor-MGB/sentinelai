import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { loadEnv } from './config/env.js';
import { createDatabase } from './infrastructure/database/client.js';

const config = loadEnv();
const database = createDatabase(config);

try {
  await migrate(database.db, {
    migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
  });
  console.log('Database migrations applied.');
} catch (error) {
  console.error(
    `Database migration failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await database.close();
}
