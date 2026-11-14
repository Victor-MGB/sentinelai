import { describe, expect, it } from 'vitest';

import { sampleJobPayloadSchema } from '../../src/infrastructure/queue/job-schemas.js';

describe('sampleJobPayloadSchema', () => {
  it('applies defaults for optional fields', () => {
    expect(
      sampleJobPayloadSchema.parse({
        type: 'system.sample',
        orgId: 'org_test',
        message: 'Hello',
      }),
    ).toEqual({
      type: 'system.sample',
      orgId: 'org_test',
      message: 'Hello',
      shouldFail: false,
    });
  });

  it('rejects unknown fields', () => {
    expect(() =>
      sampleJobPayloadSchema.parse({
        type: 'system.sample',
        orgId: 'org_test',
        message: 'Hello',
        unexpected: true,
      }),
    ).toThrowError();
  });

  it('rejects the wrong job type', () => {
    expect(() =>
      sampleJobPayloadSchema.parse({
        type: 'system.unknown',
        orgId: 'org_test',
        message: 'Hello',
      }),
    ).toThrowError();
  });
});
