import fp from 'fastify-plugin';

import { createProblemDetails } from '../shared/errors/problem-details.js';
import { mapError } from '../shared/errors/map-error.js';
import { createTraceId } from '../shared/http/request-context.js';

export const errorHandlerPlugin = fp(
  async (app) => {
    app.setErrorHandler((error, request, reply) => {
      if (!request.traceId) {
        request.traceId = createTraceId(request.headers);
      }

      const mapped = mapError(error);
      const problem = createProblemDetails(request, {
        status: mapped.status,
        code: mapped.code,
        title: mapped.title,
        detail: mapped.detail,
        ...(mapped.errors ? { errors: mapped.errors } : {}),
      });

      const logContext = {
        requestId: request.id,
        traceId: request.traceId,
        code: mapped.code,
        status: mapped.status,
        method: request.method,
        url: request.url,
      };

      if (mapped.status >= 500) {
        request.log.error({ ...logContext, err: error }, 'request.failed');
      } else {
        request.log.warn(logContext, 'request.rejected');
      }

      if (mapped.headers) {
        reply.headers(mapped.headers);
      }

      reply.code(mapped.status).type('application/problem+json').send(problem);
    });

    app.setNotFoundHandler((request, reply) => {
      if (!request.traceId) {
        request.traceId = createTraceId(request.headers);
      }

      reply.header('x-request-id', request.id);

      const problem = createProblemDetails(request, {
        status: 404,
        code: 'not_found',
        title: 'Resource not found',
        detail: 'The requested route was not found.',
      });

      reply.code(404).type('application/problem+json').send(problem);
    });
  },
  {
    name: 'error-handler',
  },
);
