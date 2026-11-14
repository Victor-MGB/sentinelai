import fp from 'fastify-plugin';

import type { AppConfig } from '../config/env.js';
import { createRedisConnection } from '../infrastructure/queue/connection.js';

export interface RedisPluginOptions {
  config: AppConfig;
}

export const redisPlugin = fp<RedisPluginOptions>(
  async (app, options) => {
    const redis = createRedisConnection(options.config);

    redis.on('error', (error) => {
      app.log.error({ err: error }, 'redis.error');
    });

    await redis.connect();
    app.decorate('redis', redis);

    app.addHook('onClose', async () => {
      await redis.quit().catch(() => {
        redis.disconnect();
      });
    });
  },
  {
    name: 'redis',
  },
);
