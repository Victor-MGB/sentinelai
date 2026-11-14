import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

export const swaggerPlugin = fp(
  async (app) => {
    await app.register(swagger, {
      openapi: {
        openapi: '3.1.0',
        info: {
          title: 'SentinelAI API',
          description:
            'SentinelAI reliability and incident response API. Errors use RFC 9457 Problem Details.',
          version: '0.1.0',
        },
        servers: [
          {
            url: '/api/v1',
            description: 'Versioned product API',
          },
        ],
        tags: [
          { name: 'Health', description: 'Service and dependency health checks.' },
          { name: 'Jobs', description: 'Background job submission and status.' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
      staticCSP: true,
    });
  },
  {
    name: 'swagger',
  },
);
