import { z } from 'zod';

export const TestingHelloResponseSchema = z.object({
  ok: z.boolean(),
});

export const TestingHelloResponseWrapperSchema = z.object({
  ok: z.boolean(),
});
