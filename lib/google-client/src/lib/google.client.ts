import type {
  GoogleRequestOptions,
  GoogleAutoCompleteResponse,
  GooglePrediction,
  GooglePlace,
  GooglePlaceDetailsResponse,
  RequestAutoCompleteInput,
  RequestAutoCompleteOutput,
  RequestPlaceDetailsOutput,
  GetPlaceByAutoCompleteInput,
  GetPlaceByAutoCompleteOutput,
  FindAddressLocationInput,
  FindAddressLocationOutput,
} from './google.client.types';

import { createLogger } from '@namespace/logger';

const logger = createLogger('google.client');

const { GOOGLE_API_KEY } = process.env;

export const isGoogleEnabled = !!GOOGLE_API_KEY;

/**
 * Makes a request to the Google Maps API endpoint with caching support.
 *
 * @param {GoogleRequestOptions} options - The request options
 * @param {string} options.method - HTTP method to use (GET, POST etc)
 * @param {string} options.path - API endpoint path
 * @param {Record<string, string>} options.params - Query parameters to include in the request
 * @returns {Promise<T | null>} The parsed JSON response, or null if Google API is not enabled
 * @throws {GoogleMapsResponseNotOkError} If the Google API request fails
 */
export async function requestGoogleEndpoint<T>({
  method,
  path,
  params,
}: GoogleRequestOptions): Promise<T | null> {
  if (!isGoogleEnabled) {
    logger.warn('[requestGoogleEndpoint] Google is not enabled. Aborting.');
    return null;
  }

  path = path.startsWith('/') ? path.slice(1) : path;
  method = method.toUpperCase();

  const url = new URL(path, 'https://maps.googleapis.com/maps/');
  url.search = new URLSearchParams({ ...params, key: GOOGLE_API_KEY || '' }).toString();

  logger.trace(`Sending ${method} request to: ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google response not OK: ${response.statusText}`);
    }

    const result = (await response.json()) as T;

    return result;
  } catch (error) {
    const googleError = new Error(`Google response not OK: ${(error as Error).message}`);
    googleError.name = 'GoogleMapsResponseNotOkError';
    throw googleError;
  }
}

/**
 * Given an input it request the google places that have the highest match.
 *
 * @param {RequestAutoCompleteInput} input - The input parameters
 * @param {string} input.input - The search text to find a place
 * @param {number} [input.radiusInMeters] - Optional radius in meters to bias results to a circular area
 * @param {boolean} [input.strictBounds] - Optional flag to return only results within the radius
 * @param {{lat: number, lng: number}} [input.location] - Optional lat/lng coordinates to bias the search results
 * @param {boolean} [input.populatePlaces] - Optional flag to populate the predictions with GooglePlace objects
 * @param {string} [input.components] - Optional components to filter the search results
 * @returns {RequestAutoCompleteOutput} The parsed JSON response, or null if Google API is not enabled
 * @throws {GoogleMapsResponseNotOkError} If the Google API request fails
 */
export async function requestAutocomplete({
  input,
  radiusInMeters,
  strictBounds,
  location,
  populatePlaces,
  components,
}: RequestAutoCompleteInput): RequestAutoCompleteOutput {
  try {
    const result = await requestGoogleEndpoint<GoogleAutoCompleteResponse>({
      method: 'GET',
      path: 'api/place/autocomplete/json',
      params: {
        input,
        components: components || 'country:us',
        ...(location && { location: `${location.lat},${location.lng}` }),
        ...(radiusInMeters && { radius: radiusInMeters.toString() }),
        ...(strictBounds && { strictbounds: strictBounds.toString() }),
        types: 'address',
      },
    });

    if (populatePlaces && result && result.predictions) {
      result.predictions = await Promise.all(
        result.predictions.map(async (prediction: GooglePrediction) => {
          if (!prediction.place_id) {
            return prediction;
          }
          const googlePlace = await requestPlaceDetails(prediction.place_id);
          if (googlePlace) {
            return {
              ...prediction,
              googlePlace,
            };
          }
          return prediction;
        }),
      );
    }

    return result;
  } catch (error) {
    logger.error(error, 'Error requesting Google autocomplete.');
    return null;
  }
}

/**
 * Requests details for a specific place from the Google Places API.
 *
 * @param {string} placeId - The unique identifier for a place in Google Places
 * @returns {RequestPlaceDetailsOutput} Promise resolving to a GooglePlace object containing geometry and address components if found, null otherwise
 * @throws {GoogleMapsResponseNotOkError} If the Google API request fails
 */
export async function requestPlaceDetails(placeId: string): RequestPlaceDetailsOutput {
  try {
    const googleApiResponse = await requestGoogleEndpoint<GooglePlaceDetailsResponse>({
      method: 'GET',
      path: 'api/place/details/json',
      params: {
        placeid: placeId,
        fields: 'geometry,address_components',
      },
    });

    if (!googleApiResponse?.result) {
      return null;
    }

    return {
      ...googleApiResponse.result,
      id: placeId,
    };
  } catch (error) {
    logger.error(error, 'Error requesting Google place details.');
    return null;
  }
}

/**
 * Gets a Google Place object by searching for a location using autocomplete and retrieving its details.
 *
 * @param input - The search text to find a place
 * @param radiusInMeters - Optional radius in meters to bias results to a circular area
 * @param strictBounds - Optional flag to return only results within the radius
 * @param location - Optional lat/lng coordinates to bias the search results
 * @returns Promise resolving to a GooglePlace object if found, null otherwise
 */
export async function getPlaceByAutoComplete({
  input,
  radiusInMeters,
  strictBounds,
  location,
}: GetPlaceByAutoCompleteInput): GetPlaceByAutoCompleteOutput {
  const response = await requestAutocomplete({
    input,
    radiusInMeters,
    strictBounds,
    location,
  });

  const googlePlaceId =
    response?.predictions && response.predictions.length > 0 && response.predictions[0].place_id
      ? response.predictions[0].place_id
      : null;

  let googlePlace: GooglePlace | null = null;
  if (googlePlaceId) {
    googlePlace = await requestPlaceDetails(googlePlaceId);
  }

  return googlePlace;
}

/**
 * Retrieves an object  Google Place object by searching for a location using autocomplete.
 *
 * @param address - The address to find the location for
 * @param address.streetName - The street name
 * @param address.streetNumber - The street number
 * @param address.city - The city
 * @param address.stateCode - The state code
 * @param address.zip - The zip code
 * @returns Promise resolving to an object containing the longitude, latitude, and googlePlaceId if found, null otherwise
 */
export async function findAddressLocation(
  address: FindAddressLocationInput,
): FindAddressLocationOutput {
  const streetPart =
    address.streetName && address.streetNumber
      ? `${address.streetNumber} ${address.streetName}`
      : '';
  const input = [streetPart, address.city, address.stateCode, address.zip]
    .filter(Boolean)
    .join(', ');

  try {
    const googlePlace = await getPlaceByAutoComplete({ input });
    if (googlePlace && googlePlace.geometry && googlePlace.geometry.location) {
      return {
        longitude: googlePlace.geometry.location.lng,
        latitude: googlePlace.geometry.location.lat,
        googlePlaceId: googlePlace.id,
      };
    }
  } catch (error) {
    logger.error(error, 'Google location by address fields not found.');
  }

  return null;
}
