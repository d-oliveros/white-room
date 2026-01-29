import type { FastifyInstance } from 'fastify';

import { zodToJsonSchema } from '@namespace/shared';
import { TestingHelloResponseSchema } from '../schemas/testing.schemas';

export default function TestingController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/testing-hello',
    schema: {
      response: {
        200: zodToJsonSchema(TestingHelloResponseSchema),
      },
    },
    handler: () => {
      return { ok: true };
    },
  });
}
