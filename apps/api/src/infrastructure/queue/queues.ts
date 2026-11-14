import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

import type { AppConfig } from '../../config/env.js';
import type { DeadLetterPayload, SampleJobPayload } from './job-schemas.js';

export const SAMPLE_QUEUE_NAME = 'system.sample';
export const SAMPLE_DLQ_NAME = 'system.sample.dlq';

export interface QueueRegistry {
  sample: Queue<SampleJobPayload>;
  sampleDlq: Queue<DeadLetterPayload>;
}

export function createQueues(connection: Redis, config: AppConfig): QueueRegistry {
  const baseOptions = {
    connection,
    prefix: config.QUEUE_PREFIX,
  };

  return {
    sample: new Queue<SampleJobPayload>(SAMPLE_QUEUE_NAME, {
      ...baseOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 24 * 60 * 60,
          count: 1000,
        },
        removeOnFail: false,
      },
    }),
    sampleDlq: new Queue<DeadLetterPayload>(SAMPLE_DLQ_NAME, {
      ...baseOptions,
      defaultJobOptions: {
        attempts: 1,
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
  };
}

export async function closeQueues(queues: QueueRegistry): Promise<void> {
  await Promise.all([queues.sample.close(), queues.sampleDlq.close()]);
}
