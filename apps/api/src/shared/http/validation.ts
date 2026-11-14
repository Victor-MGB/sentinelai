import { z, type ZodType } from 'zod';

import { validationError, type FieldError } from '../errors/app-error.js';

function toFieldErrors(error: z.ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    field:
      issue.code === 'unrecognized_keys'
        ? issue.keys.join('.') || 'request'
        : issue.path.map(String).join('.') || 'request',
    code: issue.code,
    message: issue.message,
  }));
}

export function parseInput<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);

  if (!result.success) {
    throw validationError(toFieldErrors(result.error));
  }

  return result.data;
}

export const emptyQuerySchema = z.object({}).strict();
