import type { FastifyRequest } from 'fastify';

import type { FieldError } from './app-error.js';

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  code: string;
  traceId: string;
  requestId: string;
  errors?: FieldError[];
}

const problemTypeBase = 'https://docs.sentinelai.com/errors';

export function problemType(code: string): string {
  return `${problemTypeBase}/${code.replaceAll('_', '-')}`;
}

export function createProblemDetails(
  request: FastifyRequest,
  input: {
    status: number;
    code: string;
    title: string;
    detail: string;
    errors?: FieldError[];
  },
): ProblemDetails {
  const problem: ProblemDetails = {
    type: problemType(input.code),
    title: input.title,
    status: input.status,
    detail: input.detail,
    instance: request.url.split('?')[0] ?? request.url,
    code: input.code,
    traceId: request.traceId,
    requestId: request.id,
  };

  if (input.errors && input.errors.length > 0) {
    problem.errors = input.errors;
  }

  return problem;
}
