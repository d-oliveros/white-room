import { z } from 'zod';
import { phone, isoStringParsed } from '@namespace/shared';
import { UserRole } from './user.constants';

export const UserSchema = z.object({
  id: z.string(),
  createdAt: isoStringParsed(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: phone(),
  email: z.string().email(),
  roles: z.array(z.nativeEnum(UserRole)).nonempty('At least one role is required'),
  profilePictureUrl: z.string().url().nullable(),
  password: z.string().min(4, 'Password must be at least 4 characters long'),
});

export const UserSummarySchema = UserSchema.pick({
  id: true,
  createdAt: true,
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  roles: true,
  profilePictureUrl: true,
});

export const UserCreateSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  phone: true,
  email: true,
  password: true,
});

export const UserUpdateSchema = UserSchema.partial()
  .pick({
    firstName: true,
    lastName: true,
    phone: true,
    email: true,
    roles: true,
  })
  .refine((data) => Object.values(data).some((value) => value), {
    message: 'At least one field must be provided',
  });

export const UserLoginSchema = UserSchema.pick({
  phone: true,
  email: true,
  password: true,
})
  .partial({
    phone: true,
    email: true,
  })
  .refine((data) => data.phone || data.email, {
    message: 'Either phone or email must be provided',
  });

export const UserSessionSchema = UserSchema.pick({
  id: true,
  roles: true,
});

export type UserSessionDto = z.infer<typeof UserSessionSchema>;

// Infer TypeScript type from Zod schema
export type UserCreateDto = z.infer<typeof UserCreateSchema>;
export type UserUpdateDto = z.infer<typeof UserUpdateSchema>;
export type UserLoginDto = z.infer<typeof UserLoginSchema>;
export type UserSummaryDto = z.infer<typeof UserSummarySchema>;
