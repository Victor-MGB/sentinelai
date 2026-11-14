import type { FastifyReply, FastifyRequest } from 'fastify';

import { emptyQuerySchema, parseInput } from '../../shared/http/validation.js';
import type { HealthService } from './health.service.js';

export interface HealthController {
  getStatus: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
  getLiveness: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
  getReadiness: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
}

export function createHealthController(service: HealthService): HealthController {
  return {
    getStatus: async (request, reply) => {
      parseInput(emptyQuerySchema, request.query);

      return reply.header('cache-control', 'no-store').send(await service.getStatus());
    },
    getLiveness: async (request, reply) => {
      parseInput(emptyQuerySchema, request.query);

      return reply.header('cache-control', 'no-store').send(service.getLiveness());
    },
    getReadiness: async (request, reply) => {
      parseInput(emptyQuerySchema, request.query);
      const readiness = await service.getReadiness();

      return reply
        .code(readiness.status === 'ready' ? 200 : 503)
        .header('cache-control', 'no-store')
        .send(readiness);
    },
  };
}
