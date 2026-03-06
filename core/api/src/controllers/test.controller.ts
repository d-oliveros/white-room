import type { FastifyInstance } from 'fastify';

export default function TestController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/testing-hello-1234',
    handler: () => {
      return { ok: true };
    },
  });
}
