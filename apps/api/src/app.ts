import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import Fastify, { LogController } from 'fastify';

import { getCorsOrigins, loadEnv, type AppConfig } from './config/env.js';
import { registerHealthRoutes } from './modules/health/health.routes.js';
import { registerJobsRoutes } from './modules/jobs/jobs.routes.js';
import { databasePlugin } from './plugins/database.js';
import { errorHandlerPlugin } from './plugins/error-handler.js';
import { queuesPlugin } from './plugins/queues.js';
import { rateLimitPlugin } from './plugins/rate-limit.js';
import { redisPlugin } from './plugins/redis.js';
import { requestContextPlugin } from './plugins/request-context.js';
import { swaggerPlugin } from './plugins/swagger.js';
import { createRequestId } from './shared/http/request-context.js';
import { createLogger } from './shared/logging/logger.js';

export interface BuildAppOptions {
  config?: AppConfig;
}

export async function buildApp(options: BuildAppOptions = {}) {
  const config = options.config ?? loadEnv();
  const allowedOrigins = new Set(getCorsOrigins(config));

  const app = Fastify({
    loggerInstance: createLogger(config),
    bodyLimit: config.BODY_LIMIT_BYTES,
    trustProxy: config.TRUST_PROXY,
    requestIdHeader: false,
    genReqId: (request) => createRequestId(request.headers),
    logController: new LogController({ disableRequestLogging: true }),
  });

  app.decorate('config', config);

  await app.register(helmet);
  await app.register(cors, {
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
    maxAge: 86400,
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Accept',
      'Authorization',
      'Content-Type',
      'Idempotency-Key',
      'If-Match',
      'X-CSRF-Token',
      'X-Request-ID',
      'traceparent',
    ],
    exposedHeaders: [
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset',
      'Retry-After',
      'X-Request-ID',
      'traceparent',
    ],
  });

  await app.register(requestContextPlugin);
  await app.register(databasePlugin, { config });
  await app.register(redisPlugin, { config });
  await app.register(queuesPlugin);
  await app.register(rateLimitPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(swaggerPlugin);

  await app.register(registerHealthRoutes, { prefix: '/api/v1' });
  await app.register(registerJobsRoutes, { prefix: '/api/v1' });

  await app.ready();

  return app;
}
