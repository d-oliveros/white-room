export type GoogleRequestOptions = {
  method: string;
  path: string;
  params: Record<string, string | number | boolean>;
};

export type GooglePlace = {
  id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
};

export type GooglePrediction = {
  place_id: string;
  description: string;
  googlePlace?: GooglePlace;
};

export type GoogleAutoCompleteResponse = {
  predictions: GooglePrediction[];
};

export type GooglePlaceDetailsResponse = {
  result: GooglePlace;
};

export type RequestAutoCompleteInput = {
  input: string;
  radiusInMeters?: number;
  strictBounds?: boolean;
  location?: { lat: number; lng: number };
  populatePlaces?: boolean;
  components?: string;
};

export type RequestAutoCompleteOutput = Promise<GoogleAutoCompleteResponse | null>;

export type RequestPlaceDetailsOutput = Promise<GooglePlace | null>;

export type GetPlaceByAutoCompleteInput = {
  input: string;
  radiusInMeters?: number;
  strictBounds?: boolean;
  location?: { lat: number; lng: number };
};

export type GetPlaceByAutoCompleteOutput = Promise<GooglePlace | null>;

export type FindAddressLocationInput = {
  streetName: string | null;
  streetNumber: string | null;
  city: string;
  stateCode: string;
  zip: string;
};

export type FindAddressLocationOutput = Promise<{
  longitude: number;
  latitude: number;
  googlePlaceId: string;
} | null>;
