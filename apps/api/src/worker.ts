import { loadEnv } from './config/env.js';
import { createDatabase } from './infrastructure/database/client.js';
import { createRedisConnection } from './infrastructure/queue/connection.js';
import { closeQueues, createQueues } from './infrastructure/queue/queues.js';
import { createSampleWorker } from './infrastructure/queue/sample-worker.js';
import { createLogger } from './shared/logging/logger.js';

const config = loadEnv();
const logger = createLogger(config);
const database = createDatabase(config);
const queueConnection = createRedisConnection(config);
const workerConnection = createRedisConnection(config, { blocking: true });

await queueConnection.connect();
await workerConnection.connect();

const queues = createQueues(queueConnection, config);
const worker = createSampleWorker({
  config,
  connection: workerConnection,
  database: database.db,
  queues,
  logger,
});

let shuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, 'worker.shutting_down');

  try {
    await worker.close();
    await closeQueues(queues);
    await Promise.all([
      queueConnection.quit().catch(() => queueConnection.disconnect()),
      workerConnection.quit().catch(() => workerConnection.disconnect()),
    ]);
    await database.close();
    process.exitCode = 0;
  } catch (error) {
    logger.error({ err: error, signal }, 'worker.shutdown_failed');
    process.exitCode = 1;
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

logger.info(
  {
    queue: queues.sample.name,
    deadLetterQueue: queues.sampleDlq.name,
    concurrency: config.QUEUE_CONCURRENCY,
  },
  'worker.started',
);
