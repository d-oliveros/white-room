import { z } from 'zod';
import { State } from './address.constants';

export const AddressTypeSchema = z.enum(['address', 'coordinates']);

const latitudeSchema = z
  .number()
  .min(-90)
  .max(90)
  .refine((val) => !isNaN(val), 'Latitude must be a valid number');

const longitudeSchema = z
  .number()
  .min(-180)
  .max(180)
  .refine((val) => !isNaN(val), 'Longitude must be a valid number');

export const AddressPartialSchema = z.object({
  streetName: z.string().min(1).nullable().optional(),
  streetNumber: z.string().min(1).nullable().optional(),
  streetPrefix: z.string().min(1).nullable().optional(),
  streetSuffix: z.string().min(1).nullable().optional(),
  unitNumber: z.string().min(1).nullable().optional(),
  city: z.string().min(2),
  stateCode: z.nativeEnum(State),
  county: z.string().min(1).nullable().optional(),
  countryCode: z.string().length(2).default('US'),
  zip: z
    .string()
    .length(5)
    .regex(/^\d{5}$/, 'Must be a 5-digit number'),
  latitude: latitudeSchema.nullable().optional(),
  longitude: longitudeSchema.nullable().optional(),
  type: AddressTypeSchema.optional(),
  display: z.string().min(1).nullable().optional(),
});

export const AddressParsedSchema = AddressPartialSchema.extend({
  streetName: z.string().min(1).nullable(),
  streetNumber: z.string().min(1).nullable(),
  streetPrefix: z.string().min(1).nullable(),
  streetSuffix: z.string().min(1).nullable(),
  streetDisplay: z.string().min(1).nullable(),
  county: z.string().min(1).nullable(),
  display: z.string().min(1),
});

export const AddressParsedWithLocationSchema = AddressParsedSchema.extend({
  type: AddressTypeSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export const AddressSchema = AddressParsedWithLocationSchema.extend({
  id: z.string().min(1),
  createdAt: z
    .union([z.date(), z.string()])
    .transform((value: string | Date) => {
      return value instanceof Date ? value : new Date(value);
    })
    .refine((value) => !isNaN(value.getTime()), {
      message: 'Invalid date format, must be ISO 8601 string',
    })
    .pipe(z.date()),
});

export const AddressLocationPointSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]),
});

export const LocationPointSchema = z.object({
  latitude: latitudeSchema,
  longitude: longitudeSchema,
});

export type AddressPartialDto = z.infer<typeof AddressPartialSchema>;
export type AddressParsedDto = z.infer<typeof AddressParsedSchema>;
export type AddressParsedWithLocationDto = z.infer<typeof AddressParsedWithLocationSchema>;
export type AddressDto = z.infer<typeof AddressSchema>;
export type AddressLocationPointDto = z.infer<typeof AddressLocationPointSchema>;
export type LocationPointDto = z.infer<typeof LocationPointSchema>;

export type IncompleteAddressDto = Partial<{
  [K in keyof AddressParsedWithLocationDto]: AddressParsedWithLocationDto[K] | null;
}>;

// Type for the result of the AddressParser (@sroussey/parse-address) package
export type AddressParserResult = {
  number: string | null;
  sec_unit_num: string | null;
  street: string | null;
  prefix: string | null;
  type: string | null;
  city: string | null;
  state: State | null;
  zip: string | null;
};
