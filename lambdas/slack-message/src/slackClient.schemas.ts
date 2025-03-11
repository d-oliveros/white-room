import { z } from 'zod';

const SlackIdentitySchema = z.object({
  username: z.string(),
  icon_url: z.string(),
});

export type SlackIdentity = z.infer<typeof SlackIdentitySchema>;

const SlackMessageBlockSchema = z.discriminatedUnion('type', [
  // Text blocks (section, header, etc.)
  z.object({
    type: z.enum(['section', 'header']),
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
  // Divider block
  z.object({
    type: z.literal('divider'),
  }),
  // Image block
  z.object({
    type: z.literal('image'),
    image_url: z.string(),
    alt_text: z.string(),
    title: z
      .object({
        type: z.string(),
        text: z.string(),
      })
      .optional(),
  }),
]);

export const SlackMessageSchema = z
  .object({
    channel: z.string().min(1),
    blocks: z.array(SlackMessageBlockSchema).min(1).optional(),
    identity: SlackIdentitySchema.optional(),
    text: z.string().optional(),
  })
  .refine((data) => !!data.blocks !== !!data.text, {
    message: "Exactly one of 'blocks' or 'text' must be provided, but not both",
    path: ['blocks', 'text'],
  });

export type SlackMessage = z.infer<typeof SlackMessageSchema>;
