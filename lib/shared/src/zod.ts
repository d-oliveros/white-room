import type { ZodSchema } from 'zod';
import { z } from 'zod';
import zodToJsonSchemaModule from 'zod-to-json-schema';

export const zodToJsonSchema = (schema: ZodSchema) => {
  return zodToJsonSchemaModule(schema, {
    $refStrategy: 'none',
  });
};

// Custom Zod transformer for ISO 8601 string validation and transformation
export const zodToISOStringTransformer = (value: string | Date) => {
  return value instanceof Date ? value.toISOString() : value;
};

export const zodToDateTransformer = (value: string | Date) => {
  return value instanceof Date ? value : new Date(value);
};

export const zodToDateStringTransformer = (value: string | Date) => {
  const stringValue = value instanceof Date ? value.toISOString() : value;

  return stringValue.split('T')[0];
};

// Custom Zod schema for ISO 8601 string validation
export const isoString = () =>
  z.string().refine(
    (value) => {
      return !isNaN(Date.parse(value));
    },
    {
      message: 'Invalid date format, must be ISO 8601 string',
    },
  );

// Custom Zod schema for ISO 8601 string validation and transformation
export const isoStringParsed = () =>
  z.union([z.date(), z.string()]).transform(zodToISOStringTransformer).pipe(isoString());

// Custom Zod schema to parse a date from a string
export const dateParsed = () =>
  z
    .union([z.date(), z.string()])
    .transform(zodToDateTransformer)
    .refine((value) => !isNaN(value.getTime()), {
      message: 'Invalid date format, must be ISO 8601 string',
    })
    .pipe(z.date());

// Custom Zod schema for YYYY-MM-DD string validation
export const dateString = () =>
  z.string().refine(
    (value) => {
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    },
    {
      message: 'Invalid date format, must be YYYY-MM-DD',
    },
  );

// Custom Zod schema for phone validation
export const phone = () => {
  return z
    .string()
    .length(10)
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits');
};

// Custom Zod schema for zipcode validation
export const zipCode = () => {
  return z
    .string()
    .length(5)
    .regex(/^\d{5}$/, 'Must be a 5-digit number');
};

// Custom Zod schema for latitude validation
export const latitude = () => {
  return z.number().min(-90).max(90);
};

// Custom Zod schema for longitude validation
export const longitude = () => {
  return z.number().min(-180).max(180);
};

// Custom Zod schema for GeoJSON coordinates validation
export const geoJsonCoordinates = () => {
  return z.object({
    type: z.string(),
    coordinates: z.union([
      z.array(z.array(z.tuple([z.number(), z.number()]))), // MultiPolygon
      z.array(z.tuple([z.number(), z.number()])), // Polygon
    ]),
  });
};
