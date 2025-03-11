import type { FastifyInstance, FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import type { ApiResponseError } from '@namespace/shared';
import { createLogger } from '@namespace/logger';
import { NamespaceError } from '@namespace/shared';
import { ZodError } from 'zod';
import fp from 'fastify-plugin';

const logger = createLogger('errorHandler');

export default fp(function (fastify: FastifyInstance) {
  fastify.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    logger.error(error);

    // TODO: Get error messages from route options.
    let errorMessage = 'An unexpected error occurred.';

    if (error instanceof ZodError) {
      const zodParseErrors = error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      const parseErrorMessage = zodParseErrors.map((e) => `[${e.path}: ${e.message}]`).join(' ');
      errorMessage = `An unexpected error occurred: ParsingError ${parseErrorMessage}`;
    } else if (error instanceof NamespaceError) {
      errorMessage = error.message;
    } else if ('table' in error && 'column' in error && 'detail' in error) {
      // Check if it's a Knex error
      errorMessage = (error.detail as string) || error.message;
    } else if (error.validation) {
      // Check if it's a Fastify schema validation error
      errorMessage = error.message;
    }

    const response: ApiResponseError = {
      success: false,
      data: null,
      error: errorMessage,
    };

    return reply.status(error.statusCode || 500).send(response);
  });
});
