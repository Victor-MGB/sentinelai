import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildTestApp, type TestApp } from '../fixtures/app.js';

let app: TestApp;

beforeAll(async () => {
  app = await buildTestApp();
});

afterAll(async () => {
  await app.close();
});

describe('request validation and error responses', () => {
  it('rejects an invalid request body with problem details', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/sample',
      payload: {
        orgId: '',
        message: '',
        unexpected: true,
      },
    });

    expect(response.statusCode).toBe(422);
    expect(response.headers['content-type']).toContain('application/problem+json');

    const body = response.json<{
      code: string;
      status: number;
      traceId: string;
      requestId: string;
      errors: Array<{ field: string }>;
    }>();

    expect(body.code).toBe('validation_failed');
    expect(body.status).toBe(422);
    expect(body.traceId).toMatch(/^00-/);
    expect(body.requestId).toMatch(/^req_/);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid route parameters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/jobs/not-a-valid-job-id',
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: 'validation_failed',
      errors: [expect.objectContaining({ field: 'jobId' })],
    });
  });

  it('rejects unknown query parameters', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health?unknown=value',
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({
      code: 'validation_failed',
      errors: [expect.objectContaining({ field: 'unknown' })],
    });
  });

  it('rejects malformed JSON bodies', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/sample',
      headers: { 'content-type': 'application/json' },
      payload: '{"orgId":',
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: 'invalid_request',
      status: 400,
    });
  });

  it('enforces the configured request size limit', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/jobs/sample',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify({
        orgId: 'org_test',
        message: 'x'.repeat(2000),
      }),
    });

    expect(response.statusCode).toBe(413);
    expect(response.json()).toMatchObject({
      code: 'payload_too_large',
      status: 413,
    });
  });

  it('returns problem details for unknown routes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/unknown',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      code: 'not_found',
      status: 404,
      instance: '/api/v1/unknown',
    });
  });

  it('returns 429 after the rate limit is exceeded', async () => {
    const limited = await buildTestApp({ RATE_LIMIT_MAX: 2, RATE_LIMIT_WINDOW_SECONDS: 60 });

    try {
      const options = {
        method: 'GET' as const,
        url: `/api/v1/jobs/job_${'0'.repeat(32)}`,
        remoteAddress: '10.20.30.40',
      };

      expect((await limited.inject(options)).statusCode).toBe(404);
      expect((await limited.inject(options)).statusCode).toBe(404);

      const response = await limited.inject(options);

      expect(response.statusCode).toBe(429);
      expect(response.headers['retry-after']).toBeDefined();
      expect(response.json()).toMatchObject({
        code: 'rate_limited',
        status: 429,
      });
    } finally {
      await limited.close();
    }
  });
});
