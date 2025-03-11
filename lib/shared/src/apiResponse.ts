import { z } from 'zod';

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.record(z.any()).nullable(),
  error: z.string().nullable(),
});

export const ApiResponseSuccessSchema = ApiResponseSchema.extend({
  success: z.literal(true),
  error: z.null(),
});

export const ApiResponseErrorSchema = ApiResponseSchema.extend({
  success: z.literal(false),
  data: z.null(),
  error: z.string(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type ApiResponseError = z.infer<typeof ApiResponseErrorSchema>;
