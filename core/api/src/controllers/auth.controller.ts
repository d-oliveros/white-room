import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { UserLoginDto, UserCreateDto } from '@domain/user/user.schemas';

import { zodToJsonSchema, UnauthorizedError, ApiResponseErrorSchema } from '@namespace/shared';
import { UserSummarySchema, UserCreateSchema, UserLoginSchema } from '@domain/user/user.schemas';

import { LoginResponseSchema } from '../schemas/auth.schemas';

const { NODE_ENV } = process.env;

const sessionCookieConfig = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export default function AuthController(fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/auth/login',
    schema: {
      body: {
        ...zodToJsonSchema(UserLoginSchema),
        examples: [
          {
            email: 'someone@yopmail.com',
            password: '1234',
          },
          {
            phone: '1234567890',
            password: '1234',
          },
        ],
      },
      response: {
        200: zodToJsonSchema(LoginResponseSchema),
        401: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (request: FastifyRequest<{ Body: UserLoginDto }>, reply: FastifyReply) {
      const { auth } = this.domain;
      const { token } = await auth.authService.login(request.body);

      reply.setCookie('x-session-token', token, sessionCookieConfig);

      return { message: 'Logged in successfully' };
    },
  });

  fastify.route({
    method: 'POST',
    url: '/auth/signup',
    schema: {
      body: {
        ...zodToJsonSchema(UserCreateSchema),
        examples: [
          {
            firstName: 'John',
            lastName: 'Doe',
            phone: '1234567890',
            email: 'someone@yopmail.com',
            password: '1234',
          },
        ],
      },
      response: {
        200: zodToJsonSchema(UserSummarySchema),
        400: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (
      request: FastifyRequest<{ Body: UserCreateDto }>,
      reply: FastifyReply,
    ) {
      const { auth } = this.domain;
      const { user, token } = await auth.authService.signup(request.body);

      reply.setCookie('x-session-token', token, sessionCookieConfig);

      return UserSummarySchema.parse(user);
    },
  });

  fastify.route({
    method: 'GET',
    url: '/auth/me',
    schema: {
      response: {
        200: zodToJsonSchema(UserSummarySchema),
        401: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (request: FastifyRequest) {
      const { auth } = this.domain;
      const token = request.cookies['x-session-token'];

      if (!token) {
        throw new UnauthorizedError('No token provided');
      }

      return auth.authService.getUserByToken(token);
    },
  });

  fastify.route({
    method: 'POST',
    url: '/auth/logout',
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        401: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    handler: async function (request: FastifyRequest, reply: FastifyReply) {
      const token = request.cookies['x-session-token'];
      if (typeof token !== 'string') {
        throw new UnauthorizedError('Not logged in');
      }
      reply.clearCookie('x-session-token');
      return { message: 'Logged out successfully' };
    },
  });
}
