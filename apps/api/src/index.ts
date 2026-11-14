import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';

const config = loadEnv();
const app = await buildApp({ config });

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  app.log.info({ signal }, 'server.shutting_down');

  try {
    await app.close();
    process.exitCode = 0;
  } catch (error) {
    app.log.error({ err: error, signal }, 'server.shutdown_failed');
    process.exitCode = 1;
  }
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

try {
  await app.listen({
    host: config.API_HOST,
    port: config.API_PORT,
  });
} catch (error) {
  app.log.error({ err: error }, 'server.start_failed');
  process.exitCode = 1;
  await app.close();
}
