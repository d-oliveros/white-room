# Google Maps Client

A TypeScript client for interacting with Google Maps APIs, featuring built-in Redis caching and error handling.

## Features

- Address autocomplete with Google Places API
- Place details lookup
- Geocoding support
- Built-in Redis caching
- TypeScript type definitions
- Error handling and logging

## Setup

1. Set the required environment variable:

```bash
GOOGLE_API_KEY=<your-google-api-key>
```

## Usage

### Address Autocomplete

```typescript
import { requestAutocomplete } from '@namespace/google-client';

const results = await requestAutocomplete({
  input: '123 Main St',
});

// With optional parameters
const results = await requestAutocomplete({
  input: '123 Main St',
  radiusInMeters: 5000,
  strictBounds: true,
  location: { lat: 37.7749, lng: -122.4194 },
});
```

### Get Place Details

```typescript
import { requestPlaceDetails } from '@namespace/google-client';

const place = await requestPlaceDetails('ChIJN1t_t5u5kcRYv5uNNGh9N4');
```

### Find Address Location

```typescript
import { findAddressLocation } from '@namespace/google-client';

const location = await findAddressLocation({
  streetNumber: '123',
  streetName: 'Main St',
  city: 'San Francisco',
  stateCode: 'CA',
  zip: '94105',
});
```

## API Reference

### `requestAutocomplete`

Searches for places matching the input text.

**Parameters:**

- `input`: Search text
- `radiusInMeters?`: Radius to bias results (optional)
- `strictBounds?`: Only return results within radius (optional)
- `location?`: Lat/lng coordinates to bias results (optional)
- `populatePlaces?`: Include full place details in results (optional)
- `components?`: Filter results by component (optional)

### `requestPlaceDetails`

Fetches detailed information about a specific place.

**Parameters:**

- `placeId`: Google Place ID

### `findAddressLocation`

Converts an address into coordinates.

**Parameters:**

- `address`: Object containing:
  - `streetNumber`: Street number
  - `streetName`: Street name
  - `city`: City
  - `stateCode`: State code
  - `zip`: ZIP code

## Error Handling

The client includes built-in error handling and logging. All API calls are wrapped in try-catch blocks and will return `null` on failure.

## Caching

Results are automatically cached in Redis when available.
