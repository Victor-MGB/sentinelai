import type { Redis } from 'ioredis';
import type { Worker } from 'bullmq';

import { createRedisConnection } from '../../src/infrastructure/queue/connection.js';
import { createSampleWorker } from '../../src/infrastructure/queue/sample-worker.js';
import type {
  SampleJobPayload,
  SampleJobResult,
} from '../../src/infrastructure/queue/job-schemas.js';
import { createLogger } from '../../src/shared/logging/logger.js';
import type { TestApp } from './app.js';

export interface TestWorker {
  worker: Worker<SampleJobPayload, SampleJobResult>;
  connection: Redis;
  close: () => Promise<void>;
}

export async function startTestWorker(app: TestApp): Promise<TestWorker> {
  const connection = createRedisConnection(app.config, { blocking: true });
  await connection.connect();

  const worker = createSampleWorker({
    config: app.config,
    connection,
    database: app.db,
    queues: app.queues,
    logger: createLogger(app.config),
  });

  return {
    worker,
    connection,
    close: async () => {
      await worker.close();
      await connection.quit().catch(() => connection.disconnect());
    },
  };
}
