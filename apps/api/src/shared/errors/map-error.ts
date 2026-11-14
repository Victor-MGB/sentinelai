import { ZodError } from 'zod';

import type { FieldError } from './app-error.js';
import { AppError } from './app-error.js';

export interface MappedError {
  status: number;
  code: string;
  title: string;
  detail: string;
  errors?: FieldError[];
  headers?: Record<string, string>;
}

interface FastifyLikeError {
  code?: string;
  statusCode?: number;
  validation?: Array<{
    instancePath?: string;
    schemaPath?: string;
    keyword?: string;
    message?: string;
  }>;
}

const fastifyErrorMap: Record<
  string,
  { status: number; code: string; title: string; detail: string }
> = {
  FST_ERR_CTP_INVALID_JSON_BODY: {
    status: 400,
    code: 'invalid_request',
    title: 'Malformed request body',
    detail: 'The request body is not valid JSON.',
  },
  FST_ERR_CTP_EMPTY_JSON_BODY: {
    status: 400,
    code: 'invalid_request',
    title: 'Malformed request body',
    detail: 'The request body must not be empty.',
  },
  FST_ERR_CTP_BODY_TOO_LARGE: {
    status: 413,
    code: 'payload_too_large',
    title: 'Payload too large',
    detail: 'The request body exceeds the configured size limit.',
  },
  FST_ERR_CTP_INVALID_MEDIA_TYPE: {
    status: 415,
    code: 'unsupported_media_type',
    title: 'Unsupported media type',
    detail: 'Requests with a body must use application/json.',
  },
  FST_ERR_CTP_INVALID_CONTENT_LENGTH: {
    status: 400,
    code: 'invalid_request',
    title: 'Malformed request',
    detail: 'The request content length is invalid.',
  },
};

export function mapError(error: unknown): MappedError {
  if (error instanceof AppError) {
    const mapped: MappedError = {
      status: error.statusCode,
      code: error.code,
      title: error.title,
      detail: error.detail,
    };

    if (error.errors) {
      mapped.errors = error.errors;
    }

    if (error.headers) {
      mapped.headers = error.headers;
    }

    return mapped;
  }

  if (error instanceof ZodError) {
    return {
      status: 422,
      code: 'validation_failed',
      title: 'Request validation failed',
      detail: 'One or more fields are invalid.',
      errors: error.issues.map((issue) => ({
        field:
          issue.code === 'unrecognized_keys'
            ? issue.keys.join('.') || 'request'
            : issue.path.map(String).join('.') || 'request',
        code: issue.code,
        message: issue.message,
      })),
    };
  }

  const fastifyError = error as FastifyLikeError;

  const mappedFastifyError = fastifyError.code ? fastifyErrorMap[fastifyError.code] : undefined;

  if (mappedFastifyError) {
    return mappedFastifyError;
  }

  if (fastifyError.validation) {
    return {
      status: 422,
      code: 'validation_failed',
      title: 'Request validation failed',
      detail: 'One or more fields are invalid.',
      errors: fastifyError.validation.map((issue) => ({
        field: issue.instancePath?.replace(/^\//, '').replaceAll('/', '.') || 'request',
        code: issue.keyword ?? 'invalid',
        message: issue.message ?? 'The field is invalid.',
      })),
    };
  }

  if (fastifyError.statusCode === 404) {
    return {
      status: 404,
      code: 'not_found',
      title: 'Resource not found',
      detail: 'The requested resource was not found.',
    };
  }

  return {
    status: 500,
    code: 'internal_error',
    title: 'Internal server error',
    detail: 'An unexpected error occurred. Retry the request or contact support.',
  };
}
