import type {
  AddressPartialDto,
  AddressParsedDto,
  AddressParsedWithLocationDto,
} from '@namespace/address-helpers';
import type { GooglePlace, GooglePrediction } from './google.client.types';

import { AddressParsedWithLocationSchema, normalizeAddress } from '@namespace/address-helpers';
import { isGoogleEnabled, findAddressLocation, requestAutocomplete } from './google.client';

export class GooglePlaceNotFoundError extends Error {
  constructor(message = 'Google place not found') {
    super(message);
    this.name = 'GooglePlaceNotFoundError';
  }
}

export async function populateAddressLocationFields(
  address: AddressParsedDto,
): Promise<AddressParsedWithLocationDto> {
  if (!isGoogleEnabled) {
    throw new Error('populateAddressLocationFields: Google Client is not enabled');
  }
  const addressLocation = await findAddressLocation(address);

  if (!addressLocation) {
    throw new GooglePlaceNotFoundError(`Google place by address not found: ${address.display}`);
  }

  const { longitude, latitude } = addressLocation;

  if (!longitude || !latitude) {
    throw new GooglePlaceNotFoundError(`Google location by address not found: ${address.display}`);
  }

  return {
    ...address,
    type: 'address' as const,
    longitude,
    latitude,
  };
}

export function transformGooglePlaceToAddress(
  googlePlace: GooglePlace,
): AddressParsedWithLocationDto | null {
  const partialAddress = {
    type: 'address' as const,
    streetNumber: googlePlace.address_components.find((c) => c.types.includes('street_number'))
      ?.long_name,
    streetName: googlePlace.address_components.find((c) => c.types.includes('route'))?.long_name,
    city: googlePlace.address_components.find((c) => c.types.includes('locality'))?.long_name,
    stateCode: googlePlace.address_components.find((c) =>
      c.types.includes('administrative_area_level_1'),
    )?.short_name,
    zip: googlePlace.address_components.find((c) => c.types.includes('postal_code'))?.long_name,
    county:
      googlePlace.address_components.find((c) => c.types.includes('administrative_area_level_2'))
        ?.long_name || null,
    latitude: googlePlace.geometry.location.lat,
    longitude: googlePlace.geometry.location.lng,
  };

  const normalizedAddress = normalizeAddress(partialAddress as AddressPartialDto);

  const parsedAddress = AddressParsedWithLocationSchema.safeParse(normalizedAddress);

  return parsedAddress.success ? parsedAddress.data : null;
}

export async function getAutocompleteSuggestions(
  searchTerm: string,
): Promise<AddressParsedWithLocationDto[]> {
  if (!isGoogleEnabled) {
    throw new Error('autocomplete: Google Client is not enabled');
  }
  const result = await requestAutocomplete({ input: searchTerm, populatePlaces: true });
  const predictions = result?.predictions ?? [];

  const suggestions = await Promise.all(
    predictions
      .filter((pred): pred is GooglePrediction & { googlePlace: GooglePlace } =>
        Boolean(pred.googlePlace),
      )
      .map(async ({ googlePlace }) => transformGooglePlaceToAddress(googlePlace)),
  ).then((addresses) =>
    addresses.filter((address): address is AddressParsedWithLocationDto => address !== null),
  );

  return suggestions;
}
