import type { ApiResponse } from '@namespace/shared';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import fp from 'fastify-plugin';
import { parseJSON } from '@namespace/util';
import { createLogger } from '@namespace/logger';

const apiLogger = createLogger('core.api');

export default fp(function (fastify: FastifyInstance) {
  fastify.addHook(
    'onSend',
    async (request: FastifyRequest, reply: FastifyReply, payload: string) => {
      const route = request.routeOptions.url || '';
      if (route.startsWith('/docs')) {
        return payload;
      }

      if (reply.statusCode >= 200 && reply.statusCode < 300 && typeof payload === 'string') {
        const parsedPayload = parseJSON(payload);
        const response: ApiResponse = {
          success: true,
          data: parsedPayload || null,
          error: null,
        };
        return JSON.stringify(response);
      }

      return payload;
    },
  );

  fastify.addHook('onRequest', (req, reply, done) => {
    apiLogger.info(`→ ${req.raw.method} ${req.raw.url}`);
    done();
  });

  fastify.addHook('onResponse', (req, reply, done) => {
    const logLevel = reply.statusCode >= 400 ? 'error' : 'info';
    apiLogger[logLevel](`${reply.statusCode} ${req.raw.method} ${req.raw.url}`);
    done();
  });
});
