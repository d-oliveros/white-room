import type { FastifyInstance } from 'fastify';

export default function TestingController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/testing-hello',
    handler: () => {
      return { ok: true };
    },
  });
}
