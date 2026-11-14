import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { AppError } from '../../src/shared/errors/app-error.js';
import { mapError } from '../../src/shared/errors/map-error.js';

describe('mapError', () => {
  it('maps application errors including headers', () => {
    const error = new AppError({
      statusCode: 429,
      code: 'rate_limited',
      title: 'Too many requests',
      detail: 'Slow down.',
      headers: { 'Retry-After': '10' },
    });

    expect(mapError(error)).toEqual({
      status: 429,
      code: 'rate_limited',
      title: 'Too many requests',
      detail: 'Slow down.',
      headers: { 'Retry-After': '10' },
    });
  });

  it('maps Zod errors to field errors', () => {
    const result = z
      .object({ email: z.email(), age: z.number().int() })
      .safeParse({ email: 'not-an-email', age: 1.5 });

    expect(result.success).toBe(false);

    if (result.success) {
      throw new Error('Expected validation to fail.');
    }

    const mapped = mapError(result.error);

    expect(mapped).toMatchObject({
      status: 422,
      code: 'validation_failed',
    });
    expect(mapped.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'age' }),
      ]),
    );
  });

  it('maps known Fastify request errors', () => {
    expect(mapError({ code: 'FST_ERR_CTP_BODY_TOO_LARGE' })).toEqual({
      status: 413,
      code: 'payload_too_large',
      title: 'Payload too large',
      detail: 'The request body exceeds the configured size limit.',
    });
  });

  it('maps unknown errors to a safe internal error', () => {
    expect(mapError(new Error('secret implementation detail'))).toEqual({
      status: 500,
      code: 'internal_error',
      title: 'Internal server error',
      detail: 'An unexpected error occurred. Retry the request or contact support.',
    });
  });
});
