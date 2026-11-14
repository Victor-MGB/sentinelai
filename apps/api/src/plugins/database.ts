import fp from 'fastify-plugin';

import type { AppConfig } from '../config/env.js';
import { createDatabase } from '../infrastructure/database/client.js';

export interface DatabasePluginOptions {
  config: AppConfig;
}

export const databasePlugin = fp<DatabasePluginOptions>(
  async (app, options) => {
    const database = createDatabase(options.config);

    database.pool.on('error', (error) => {
      app.log.error({ err: error }, 'postgres.pool.error');
    });

    app.decorate('db', database.db);
    app.decorate('pool', database.pool);

    app.addHook('onClose', async () => {
      await database.close();
    });
  },
  {
    name: 'database',
  },
);
