import { loadEnv, redactUrl } from './lib/env.js';

try {
  const env = loadEnv();
  console.log('Environment configuration is valid.');
  console.log(`NODE_ENV=${env.NODE_ENV}`);
  console.log(`LOG_LEVEL=${env.LOG_LEVEL}`);
  console.log(`API_PORT=${env.API_PORT}`);
  console.log(`WEB_PORT=${env.WEB_PORT}`);
  console.log(`DATABASE_URL=${redactUrl(env.DATABASE_URL)}`);
  console.log(`REDIS_URL=${redactUrl(env.REDIS_URL)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
