import { z } from 'zod';
import { Lambda } from './lambda.enums';

export const PdfGeneratorRequestSchema = z.object({
  url: z.string().url('URL must be a valid URL'),
  waitForSelector: z.string().optional(),
  requestId: z.string(),
  metadata: z
    .object({
      projectId: z.string().optional(),
      assetType: z.string().optional(),
      fileNumber: z.string().optional(),
    })
    .optional(),
});

export type PdfGeneratorRequest = z.infer<typeof PdfGeneratorRequestSchema>;

export const PdfGeneratorResponseSchema = z.object({
  pdfUrl: z.string(),
  requestId: z.string(),
});

export type PdfGeneratorResponse = z.infer<typeof PdfGeneratorResponseSchema>;

export const SlackMessageRequestSchema = z.object({
  channel: z.string(),
  blocks: z
    .array(
      z.object({
        type: z.string(),
        text: z
          .object({
            type: z.string(),
            text: z.string(),
          })
          .optional(),
        fields: z
          .array(
            z.object({
              type: z.string(),
              text: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  text: z.string().optional(),
  identity: z
    .object({
      username: z.string(),
      icon_url: z.string(),
    })
    .optional(),
});

export type SlackMessageRequest = z.infer<typeof SlackMessageRequestSchema>;

export const SlackMessageResponseSchema = z.void();
export type SlackMessageResponse = z.infer<typeof SlackMessageResponseSchema>;

export const LambdaPayloadMapSchema = z.object({
  [Lambda.SlackMessage]: z.object({
    request: SlackMessageRequestSchema,
    response: SlackMessageResponseSchema,
  }),
  [Lambda.PdfGenerator]: z.object({
    request: PdfGeneratorRequestSchema,
    response: PdfGeneratorResponseSchema,
  }),
});

export type LambdaPayloadMap = z.infer<typeof LambdaPayloadMapSchema>;
export type LambdaPayload = LambdaPayloadMap[keyof LambdaPayloadMap];
