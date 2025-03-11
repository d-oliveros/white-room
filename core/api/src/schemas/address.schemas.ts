import { z } from 'zod';
import { AddressSchema, AddressParsedWithLocationSchema } from '@namespace/address-helpers';

export const AddressIdParamsSchema = z.object({
  addressId: z.string(),
});

export const AddressGetResponseSchema = z.object({
  address: AddressSchema,
});

export const AddressAutocompleteQuerySchema = z.object({
  searchTerm: z.string(),
});

export const AddressAutocompleteResponseSchema = z.object({
  suggestions: z.array(AddressParsedWithLocationSchema),
});
