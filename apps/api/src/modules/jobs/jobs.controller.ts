import type { FastifyReply, FastifyRequest } from 'fastify';

import { dataResponse } from '../../shared/http/response.js';
import { parseInput } from '../../shared/http/validation.js';
import { enqueueSampleJobSchema, jobParamsSchema, type JobsService } from './jobs.service.js';

export interface JobsController {
  enqueueSample: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
  getJob: (request: FastifyRequest, reply: FastifyReply) => Promise<FastifyReply>;
}

export function createJobsController(service: JobsService): JobsController {
  return {
    enqueueSample: async (request, reply) => {
      const body = parseInput(enqueueSampleJobSchema, request.body);
      const job = await service.enqueueSample(body, request.id);

      return reply.code(202).send(dataResponse(request, job));
    },
    getJob: async (request, reply) => {
      const params = parseInput(jobParamsSchema, request.params);
      const job = await service.getJob(params.jobId);

      return reply.send(dataResponse(request, job));
    },
  };
}
