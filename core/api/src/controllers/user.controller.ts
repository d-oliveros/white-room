import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';

import { zodToJsonSchema, ApiResponseErrorSchema } from '@namespace/shared';
import { UserSummarySchema } from '@domain/user/user.schemas';

import {
  UserGetPathParamsSchema,
  UserGetResponseSchema,
  UserGetListResponseSchema,
  UserUpdateBodySchema,
} from '../schemas/user.schemas';

export default function UserController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/users',
    schema: {
      response: {
        200: zodToJsonSchema(UserGetListResponseSchema),
        400: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    async handler() {
      const { user } = this.domain;
      const users = await user.userService.getList();

      return {
        users,
      };
    },
  });

  fastify.route({
    method: 'GET',
    url: '/users/:userId',
    schema: {
      params: zodToJsonSchema(UserGetPathParamsSchema),
      response: {
        200: zodToJsonSchema(UserGetResponseSchema),
        404: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (
      request: FastifyRequest<{ Params: z.infer<typeof UserGetPathParamsSchema> }>,
    ) {
      const { userId } = request.params;
      const { user } = this.domain;

      const foundUser = await user.userService.getById(userId);

      return {
        user: UserSummarySchema.parse(foundUser),
      };
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/users/:userId',
    schema: {
      params: zodToJsonSchema(UserGetPathParamsSchema),
      response: {
        204: {},
        404: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (
      request: FastifyRequest<{ Params: z.infer<typeof UserGetPathParamsSchema> }>,
      reply: FastifyReply,
    ) {
      const { userId } = request.params;
      const { user } = this.domain;

      await user.userService.deleteUser(userId);

      return reply.status(204).send();
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/users/:userId',
    schema: {
      params: zodToJsonSchema(UserGetPathParamsSchema),
      body: zodToJsonSchema(UserUpdateBodySchema),
      response: {
        200: zodToJsonSchema(UserGetResponseSchema),
        404: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (
      request: FastifyRequest<{
        Params: z.infer<typeof UserGetPathParamsSchema>;
        Body: z.infer<typeof UserUpdateBodySchema>;
      }>,
    ) {
      const { userId } = request.params;
      const {
        user: { userService },
      } = this.domain;

      const updatedUser = await userService.updateUser(userId, request.body);

      return {
        user: UserSummarySchema.parse(updatedUser),
      };
    },
  });
}
