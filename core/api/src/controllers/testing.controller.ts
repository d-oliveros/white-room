import type { FastifyInstance } from 'fastify';

export default function TestingController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/testing-router1234',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
          },
        },
      },
    },
    handler: async function () {
      return { ok: true };
    },
  });
}
