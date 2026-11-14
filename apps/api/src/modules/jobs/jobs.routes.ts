import type { FastifyInstance } from 'fastify';

import { JobsRepository } from './jobs.repository.js';
import { createJobsController } from './jobs.controller.js';
import { JobsService } from './jobs.service.js';

export async function registerJobsRoutes(app: FastifyInstance): Promise<void> {
  const service = new JobsService(new JobsRepository(app.db), app.queues);
  const controller = createJobsController(service);

  app.post(
    '/jobs/sample',
    {
      schema: {
        tags: ['Jobs'],
        summary: 'Enqueue the sample background job',
        description:
          'Creates a tracked job run and publishes it to the BullMQ sample queue. Returns 202 Accepted.',
      },
    },
    controller.enqueueSample,
  );

  app.get(
    '/jobs/:jobId',
    {
      schema: {
        tags: ['Jobs'],
        summary: 'Get background job status',
        description: 'Returns the persisted job run status, attempts, result, and error.',
      },
    },
    controller.getJob,
  );
}
