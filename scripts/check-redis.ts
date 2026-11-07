import { Redis } from 'ioredis';
import { loadEnv } from './lib/env.js';

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Redis connection timed out.'));
    }, milliseconds);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

const env = loadEnv();
const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  connectTimeout: 5000,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
});

try {
  await withTimeout(redis.connect(), 6000);
  const pong = await withTimeout(redis.ping(), 6000);
  console.log(`Redis connected: ${pong}`);
} catch (error) {
  console.error(
    `Redis connection failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
} finally {
  redis.disconnect();
}
