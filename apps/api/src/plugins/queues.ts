import fp from 'fastify-plugin';

import { closeQueues, createQueues } from '../infrastructure/queue/queues.js';

export const queuesPlugin = fp(
  async (app) => {
    const queues = createQueues(app.redis, app.config);

    app.decorate('queues', queues);

    app.addHook('onClose', async () => {
      await closeQueues(queues);
    });
  },
  {
    name: 'queues',
    dependencies: ['redis'],
  },
);
