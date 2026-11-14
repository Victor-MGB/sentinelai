import { Redis } from 'ioredis';

import type { AppConfig } from '../../config/env.js';

export interface RedisConnectionOptions {
  blocking?: boolean;
}

export function createRedisConnection(
  config: AppConfig,
  options: RedisConnectionOptions = {},
): Redis {
  return new Redis(config.REDIS_URL, {
    lazyConnect: true,
    enableReadyCheck: true,
    connectTimeout: 5000,
    maxRetriesPerRequest: options.blocking ? null : 1,
    retryStrategy: (attempt) => Math.min(attempt * 200, 2000),
  });
}

export async function checkRedis(redis: Redis): Promise<{
  name: string;
  status: 'up' | 'down';
  latencyMs: number | null;
}> {
  const startedAt = process.hrtime.bigint();

  try {
    const response = await redis.ping();
    if (response !== 'PONG') {
      throw new Error('Unexpected Redis ping response.');
    }

    return {
      name: 'redis',
      status: 'up',
      latencyMs: Number((process.hrtime.bigint() - startedAt) / 1_000_000n),
    };
  } catch {
    return {
      name: 'redis',
      status: 'down',
      latencyMs: null,
    };
  }
}
