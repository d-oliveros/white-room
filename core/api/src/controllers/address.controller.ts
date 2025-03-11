import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { z } from 'zod';

import {
  zodToJsonSchema,
  ApiResponseErrorSchema,
  ServiceUnavailableError,
} from '@namespace/shared';
import { isGoogleEnabled, getAutocompleteSuggestions } from '@namespace/google-client';
import { AddressSchema, AddressPartialSchema } from '@namespace/address-helpers';
import {
  AddressIdParamsSchema,
  AddressGetResponseSchema,
  AddressAutocompleteQuerySchema,
  AddressAutocompleteResponseSchema,
} from '../schemas/address.schemas';

export default function AddressController(fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/addresses/:addressId',
    schema: {
      params: zodToJsonSchema(AddressIdParamsSchema),
      response: {
        200: zodToJsonSchema(AddressGetResponseSchema),
        404: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    async handler(request: FastifyRequest<{ Params: z.infer<typeof AddressIdParamsSchema> }>) {
      const { addressId } = request.params;
      const { addressService } = this.domain.address;

      const address = await addressService.getById(addressId);

      return {
        address: AddressSchema.parse(address),
      };
    },
  });

  fastify.route({
    method: 'GET',
    url: '/google/autocomplete',
    schema: {
      querystring: zodToJsonSchema(AddressAutocompleteQuerySchema),
      response: {
        200: zodToJsonSchema(AddressAutocompleteResponseSchema),
        503: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    async handler(
      request: FastifyRequest<{
        Querystring: z.infer<typeof AddressAutocompleteQuerySchema>;
      }>,
    ) {
      const { searchTerm } = request.query;

      if (!isGoogleEnabled) {
        throw new ServiceUnavailableError('Google service is not available');
      }

      const suggestions = await getAutocompleteSuggestions(searchTerm);

      return { suggestions };
    },
  });

  fastify.route({
    method: 'POST',
    url: '/addresses',
    schema: {
      body: {
        ...zodToJsonSchema(AddressPartialSchema),
        examples: [
          {
            streetName: 'Vista',
            streetNumber: '4500',
            streetSuffix: 'Pl',
            city: 'La Cañada Flintridge',
            stateCode: 'CA',
            zip: '91011',
          },
          {
            city: 'La Cañada Flintridge',
            stateCode: 'CA',
            zip: '91011',
            latitude: 34.2058,
            longitude: -118.2,
            display: 'La Cañada Flintridge Viewpoint (34.2058, -118.2000)',
          },
        ],
      },
      response: {
        201: zodToJsonSchema(AddressGetResponseSchema),
        400: zodToJsonSchema(ApiResponseErrorSchema),
      },
    },
    async handler(
      request: FastifyRequest<{ Body: z.infer<typeof AddressPartialSchema> }>,
      reply: FastifyReply,
    ) {
      const { addressService } = this.domain.address;
      const address = await addressService.getOrCreate(request.body);

      return reply.status(201).send({
        address: AddressSchema.parse(address),
      });
    },
  });
}
