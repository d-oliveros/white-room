import type { FastifyInstance } from 'fastify';

import fp from 'fastify-plugin';
import { createLogger } from '@namespace/logger';

const logger = createLogger('lambda.backend');

export default fp(function (fastify: FastifyInstance) {
  fastify.addHook('onRequest', (req, reply, done) => {
    logger.info(`-> ${req.raw.method} ${req.raw.url}`);
    done();
  });

  fastify.addHook('onResponse', (req, reply, done) => {
    const logLevel = reply.statusCode >= 400 ? 'error' : 'info';
    logger[logLevel](`${reply.statusCode} ${req.raw.method} ${req.raw.url}`);
    done();
  });
});
