import { readFileSync } from 'node:fs';

import type { FastifyInstance } from 'fastify';

import { createHealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

const dependencyCheckSchema = {
  type: 'object',
  required: ['name', 'status', 'latencyMs'],
  properties: {
    name: { type: 'string' },
    status: { type: 'string', enum: ['up', 'down'] },
    latencyMs: { type: ['integer', 'null'] },
  },
} as const;

const healthStatusSchema = {
  type: 'object',
  required: ['status', 'version', 'uptimeSeconds'],
  properties: {
    status: { type: 'string', enum: ['ok', 'degraded'] },
    version: { type: 'string' },
    uptimeSeconds: { type: 'integer', minimum: 0 },
  },
} as const;

const livenessSchema = {
  type: 'object',
  required: ['status'],
  properties: {
    status: { type: 'string', enum: ['alive'] },
  },
} as const;

const readinessSchema = {
  type: 'object',
  required: ['status', 'checks'],
  properties: {
    status: { type: 'string', enum: ['ready', 'not_ready'] },
    checks: { type: 'array', items: dependencyCheckSchema },
  },
} as const;

function readVersion(): string {
  try {
    const packageJson = JSON.parse(
      readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'),
    ) as { version?: string };
    return packageJson.version ?? '0.1.0';
  } catch {
    return '0.1.0';
  }
}

export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  const service = new HealthService(app.pool, app.redis, readVersion());
  const controller = createHealthController(service);

  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Get service health',
        description: 'Reports aggregate health for the API and its dependencies.',
        security: [],
        response: {
          200: healthStatusSchema,
        },
      },
    },
    controller.getStatus,
  );

  app.get(
    '/health/live',
    {
      schema: {
        tags: ['Health'],
        summary: 'Get liveness status',
        description: 'Returns 200 while the process is running. Does not check dependencies.',
        security: [],
        response: {
          200: livenessSchema,
        },
      },
    },
    controller.getLiveness,
  );

  app.get(
    '/health/ready',
    {
      schema: {
        tags: ['Health'],
        summary: 'Get readiness status',
        description:
          'Checks PostgreSQL and Redis connectivity. Returns 503 when a dependency is down.',
        security: [],
        response: {
          200: readinessSchema,
          503: readinessSchema,
        },
      },
    },
    controller.getReadiness,
  );
}
