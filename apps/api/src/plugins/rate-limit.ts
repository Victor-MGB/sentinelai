import fp from 'fastify-plugin';

import { AppError } from '../shared/errors/app-error.js';

const publicHealthPrefix = '/api/v1/health';

export const rateLimitPlugin = fp(
  async (app) => {
    app.addHook('onRequest', async (request, reply) => {
      if (request.method === 'OPTIONS' || request.url.startsWith(publicHealthPrefix)) {
        return;
      }

      const windowSeconds = app.config.RATE_LIMIT_WINDOW_SECONDS;
      const max = app.config.RATE_LIMIT_MAX;
      const windowBucket = Math.floor(Date.now() / 1000 / windowSeconds);
      const key = `ratelimit:ip:${request.ip}:${windowBucket}`;

      try {
        const count = await app.redis.incr(key);

        if (count === 1) {
          await app.redis.expire(key, windowSeconds);
        }

        const ttl = await app.redis.ttl(key);
        const remaining = Math.max(0, max - count);

        reply.header('RateLimit-Limit', max);
        reply.header('RateLimit-Remaining', remaining);
        reply.header('RateLimit-Reset', Math.max(ttl, 0));

        if (count > max) {
          reply.header('Retry-After', Math.max(ttl, 1));

          throw new AppError({
            statusCode: 429,
            code: 'rate_limited',
            title: 'Too many requests',
            detail: 'The rate limit has been exceeded. Retry after the reset window.',
          });
        }
      } catch (error) {
        if (error instanceof AppError) {
          throw error;
        }

        request.log.warn({ err: error }, 'rate_limit.unavailable');
      }
    });
  },
  {
    name: 'rate-limit',
    dependencies: ['redis'],
  },
);
