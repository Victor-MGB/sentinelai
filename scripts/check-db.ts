import { Client } from 'pg';
import { loadEnv } from './lib/env.js';

const env = loadEnv();
const client = new Client({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  query_timeout: 5000,
});

try {
  await client.connect();

  const version = await client.query<{ version: string }>('select version()');
  const extensions = await client.query<{ extname: string }>(
    "select extname from pg_extension where extname in ('vector', 'pgcrypto') order by extname",
  );

  const names = extensions.rows.map((row) => row.extname);
  console.log(`PostgreSQL connected: ${version.rows[0]?.version ?? 'unknown version'}`);
  console.log(`Installed extensions: ${names.length > 0 ? names.join(', ') : 'none'}`);

  if (!names.includes('vector')) {
    console.error('Required extension missing: vector');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(
    `PostgreSQL connection failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  await client.end().catch(() => undefined);
}
