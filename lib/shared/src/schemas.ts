import { z } from 'zod';

export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const PointSchema = z.tuple([z.number(), z.number()]);
export type Point = z.infer<typeof PointSchema>;

/*
export enum FileType {
  Image = 'image',
  PDF = 'pdf',
}

export const FileSchema = z.object({
  url: z.string(),
  type: z.nativeEnum(FileType),
  mimeType: z.string(),
  size: z.number(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type FileDto = z.infer<typeof FileSchema>;
*/
