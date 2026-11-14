import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildTestApp, type TestApp } from '../fixtures/app.js';

let app: TestApp;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('health endpoints', () => {
  it('returns liveness without checking dependencies', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health/live',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'alive' });
    expect(response.headers['x-request-id']).toBeTruthy();
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('returns aggregate service health', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: 'ok',
      version: expect.any(String),
      uptimeSeconds: expect.any(Number),
    });
  });

  it('reports PostgreSQL and Redis readiness', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health/ready',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json<{
      status: string;
      checks: Array<{ name: string; status: string }>;
    }>();

    expect(body.status).toBe('ready');
    expect(body.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'postgresql', status: 'up' }),
        expect.objectContaining({ name: 'redis', status: 'up' }),
      ]),
    );
  });

  it('verifies database and Redis connectivity directly', async () => {
    const result = await app.pool.query<{ value: number }>('select 1 as value');
    const pong = await app.redis.ping();

    expect(result.rows[0]?.value).toBe(1);
    expect(pong).toBe('PONG');
  });

  it('publishes the documented OpenAPI contract', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);

    const document = response.json<{
      openapi: string;
      paths: Record<string, unknown>;
    }>();

    expect(document.openapi).toMatch(/^3\.1/);
    expect(document.paths).toHaveProperty('/health');
    expect(document.paths).toHaveProperty('/health/live');
    expect(document.paths).toHaveProperty('/health/ready');
    expect(document.paths).toHaveProperty('/jobs/sample');
  });
});
