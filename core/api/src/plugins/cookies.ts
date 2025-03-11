import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cookie from '@fastify/cookie';

/**
 * This plugins adds cookies support to the API.
 *
 * @see https://github.com/fastify/fastify-cookie
 */
export default fp(function (fastify: FastifyInstance) {
  fastify.register(cookie);
});
