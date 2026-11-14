import type { FastifyRequest } from 'fastify';

export interface DataResponse<T> {
  data: T;
  meta: {
    requestId: string;
  };
}

export function dataResponse<T>(request: FastifyRequest, data: T): DataResponse<T> {
  return {
    data,
    meta: {
      requestId: request.id,
    },
  };
}
