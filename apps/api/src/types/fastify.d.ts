import type { Redis } from 'ioredis';
import type { Pool } from 'pg';

import type { AppConfig } from '../config/env.js';
import type { Database } from '../infrastructure/database/client.js';
import type { QueueRegistry } from '../infrastructure/queue/queues.js';

declare module 'fastify' {
  interface FastifyInstance {
    config: AppConfig;
    db: Database;
    pool: Pool;
    redis: Redis;
    queues: QueueRegistry;
  }

  interface FastifyRequest {
    startTime: bigint;
    traceId: string;
  }
}
