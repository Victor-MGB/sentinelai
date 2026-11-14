import { describe, expect, it } from 'vitest';

import { createRequestId, createTraceId } from '../../src/shared/http/request-context.js';

describe('request context helpers', () => {
  it('preserves a valid request id supplied by the client', () => {
    expect(createRequestId({ 'x-request-id': 'req_01JB3M9A2B4C6D8E0F2G4H6JKM' })).toBe(
      'req_01JB3M9A2B4C6D8E0F2G4H6JKM',
    );
  });

  it('replaces invalid request ids', () => {
    expect(createRequestId({ 'x-request-id': 'bad' })).toMatch(/^req_[0-9a-f]{32}$/);
  });

  it('preserves a valid traceparent header', () => {
    const traceparent = `00-${'a'.repeat(32)}-${'b'.repeat(16)}-01`;

    expect(createTraceId({ traceparent })).toBe(traceparent);
  });

  it('generates a traceparent when the supplied value is invalid', () => {
    expect(createTraceId({ traceparent: 'invalid' })).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });
});
