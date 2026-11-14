import { randomBytes, randomUUID } from 'node:crypto';

import type { IncomingHttpHeaders } from 'node:http';

const requestIdPattern = /^[A-Za-z0-9._:-]{8,128}$/;
const traceParentPattern = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/i;

export function createRequestId(headers: IncomingHttpHeaders): string {
  const supplied = headers['x-request-id'];

  if (typeof supplied === 'string' && requestIdPattern.test(supplied)) {
    return supplied;
  }

  return `req_${randomUUID().replaceAll('-', '')}`;
}

export function createTraceId(headers: IncomingHttpHeaders): string {
  const supplied = headers.traceparent;

  if (typeof supplied === 'string' && traceParentPattern.test(supplied)) {
    return supplied;
  }

  const traceId = randomBytes(16).toString('hex');
  const spanId = randomBytes(8).toString('hex');
  return `00-${traceId}-${spanId}-01`;
}
