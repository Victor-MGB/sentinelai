import fp from 'fastify-plugin';

import { createTraceId } from '../shared/http/request-context.js';

export const requestContextPlugin = fp(
  async (app) => {
    app.addHook('onRequest', async (request, reply) => {
      request.startTime = process.hrtime.bigint();
      request.traceId = createTraceId(request.headers);

      reply.header('x-request-id', request.id);
      reply.header('traceparent', request.traceId);

      request.log.info(
        {
          requestId: request.id,
          traceId: request.traceId,
          method: request.method,
          url: request.url,
          ip: request.ip,
        },
        'request.started',
      );
    });

    app.addHook('onResponse', async (request, reply) => {
      const durationMs = request.startTime
        ? Number((process.hrtime.bigint() - request.startTime) / 1_000_000n)
        : null;

      const logContext = {
        requestId: request.id,
        traceId: request.traceId,
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs,
      };

      if (reply.statusCode >= 500) {
        request.log.error(logContext, 'request.completed');
      } else if (reply.statusCode >= 400) {
        request.log.warn(logContext, 'request.completed');
      } else {
        request.log.info(logContext, 'request.completed');
      }
    });
  },
  {
    name: 'request-context',
  },
);
