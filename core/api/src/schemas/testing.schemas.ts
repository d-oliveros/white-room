import { z } from 'zod';

export const TestingHelloResponseSchema = z.object({
  ok: z.literal(true),
});
