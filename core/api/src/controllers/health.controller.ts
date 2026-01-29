import type { FastifyInstance } from 'fastify';

export default function HealthController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/testing-hello',
    handler: () => {
      return { ok: true };
    },
  });
}
