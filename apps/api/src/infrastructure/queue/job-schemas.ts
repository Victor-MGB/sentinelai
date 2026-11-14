import { z } from 'zod';

export const sampleJobPayloadSchema = z
  .object({
    type: z.literal('system.sample'),
    orgId: z.string().min(1).max(64),
    message: z.string().min(1).max(500),
    shouldFail: z.boolean().default(false),
    requestId: z.string().min(1).max(128).optional(),
  })
  .strict();

export type SampleJobPayload = z.infer<typeof sampleJobPayloadSchema>;

export const sampleJobResultSchema = z.object({
  message: z.string(),
  processedAt: z.string(),
  attempt: z.number().int().positive(),
});

export type SampleJobResult = z.infer<typeof sampleJobResultSchema>;

export const deadLetterPayloadSchema = z.object({
  sourceQueue: z.string(),
  jobId: z.string(),
  jobName: z.string(),
  payload: z.unknown(),
  failedReason: z.string(),
  attemptsMade: z.number().int().nonnegative(),
  failedAt: z.string(),
});

export type DeadLetterPayload = z.infer<typeof deadLetterPayloadSchema>;
