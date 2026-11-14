export interface FieldError {
  field: string;
  code: string;
  message: string;
}

export interface AppErrorOptions {
  statusCode: number;
  code: string;
  title: string;
  detail: string;
  errors?: FieldError[];
  headers?: Record<string, string>;
  cause?: unknown;
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly title: string;
  readonly detail: string;
  readonly errors: FieldError[] | undefined;
  readonly headers: Record<string, string> | undefined;

  constructor(options: AppErrorOptions) {
    super(options.detail, { cause: options.cause });
    this.name = 'AppError';
    this.statusCode = options.statusCode;
    this.code = options.code;
    this.title = options.title;
    this.detail = options.detail;
    this.errors = options.errors;
    this.headers = options.headers;
  }
}

export function validationError(errors: FieldError[]): AppError {
  return new AppError({
    statusCode: 422,
    code: 'validation_failed',
    title: 'Request validation failed',
    detail: 'One or more fields are invalid.',
    errors,
  });
}

export function notFoundError(detail = 'The requested resource was not found.'): AppError {
  return new AppError({
    statusCode: 404,
    code: 'not_found',
    title: 'Resource not found',
    detail,
  });
}

export function dependencyUnavailableError(
  detail = 'A required dependency is unavailable.',
): AppError {
  return new AppError({
    statusCode: 503,
    code: 'dependency_unavailable',
    title: 'Dependency unavailable',
    detail,
    headers: { 'Retry-After': '5' },
  });
}
