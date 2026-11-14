import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { AppError } from '../../src/shared/errors/app-error.js';
import { emptyQuerySchema, parseInput } from '../../src/shared/http/validation.js';

describe('parseInput', () => {
  it('returns parsed and transformed values', () => {
    const schema = z.object({
      name: z.string().trim(),
      count: z.coerce.number().int(),
    });

    expect(parseInput(schema, { name: '  sentinel  ', count: '3' })).toEqual({
      name: 'sentinel',
      count: 3,
    });
  });

  it('throws a standardized validation error for invalid input', () => {
    const schema = z.object({
      name: z.string().min(3),
    });

    let error: unknown;

    try {
      parseInput(schema, { name: 'ab' });
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      statusCode: 422,
      code: 'validation_failed',
      errors: [
        {
          field: 'name',
          code: 'too_small',
        },
      ],
    });
  });

  it('rejects unknown query parameters', () => {
    expect(() => parseInput(emptyQuerySchema, { unexpected: 'value' })).toThrowError(AppError);
  });

  it('accepts an empty query object', () => {
    expect(parseInput(emptyQuerySchema, {})).toEqual({});
  });
});
