import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwaggerUI from '@fastify/swagger-ui';

// Define the Web API Swagger UI configuration
export const webSwaggerUiPlugin = fp(
  async function (fastify: FastifyInstance) {
    await fastify.register(fastifySwaggerUI, {
      routePrefix: '/docs',
      uiConfig: {
        deepLinking: false,
      },
      theme: {
        css: [
          {
            filename: 'theme.css',
            content: '.download-url-wrapper { display: none !important; }',
          },
        ],
      },
    });
  },
  { encapsulate: true },
);
