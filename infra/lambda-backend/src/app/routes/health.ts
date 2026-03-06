import type { FastifyInstance } from 'fastify';
import type { AppOptions } from '../app';

export default async function (fastify: FastifyInstance, _opts: AppOptions) {
  fastify.get('/testing-12345', async function () {
    return { status: 'ok' };
  });
}
