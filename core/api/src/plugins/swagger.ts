import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';

/**
 * This plugin registers Swagger.
 */
export default fp(async function (fastify: FastifyInstance) {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'Namespace API',
        description: 'API interface. Manually create requests to the API using this UI.',
        version: '1.0.0',
      },
    },
  });

  // Hook to automatically tag routes based on directory path
  fastify.addHook('onRoute', async (routeOptions) => {
    if (!routeOptions.schema) {
      routeOptions.schema = {};
    }

    const pathTag = routeOptions.url.split('/').filter(Boolean)[0];
    if (!pathTag) {
      return;
    }

    routeOptions.schema.tags = [`${pathTag}`];
  });
});
