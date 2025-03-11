import { z } from 'zod';

export const LoginResponseSchema = z.object({
  message: z.string(),
});
