import { z } from 'zod';
import { UserSummarySchema, UserUpdateSchema } from '@domain/user/user.schemas';

export const UserGetPathParamsSchema = z.object({
  userId: z.string(),
});

export const UserGetResponseSchema = z.object({
  user: UserSummarySchema,
});

export const UserGetListResponseSchema = z.object({
  users: UserSummarySchema.array(),
});

export const UserUpdateBodySchema = UserUpdateSchema;
