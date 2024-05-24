import lodashCompact from 'lodash/fp/compact';
import lodashUniq from 'lodash/fp/uniq';

import typeCheck from 'common/util/typeCheck';

import {
  makeAddressStreetDisplay,
  makeFullAddressDisplay,
  makeLocationPointString,
} from 'common/addressHelpers';

export {
  geocodeByAddress as getGooglePlaceByListingAddress,
} from 'react-places-autocomplete';

const addressStreetNameVariantBlacklist = [
  'n',
  'north',
  's',
  'south',
  'e',
  'east',
  'w',
  'west',
  'ln',
  'lane',
  'st',
  'street',
  'rd',
  'road',
  'avenue',
];

const findAddressComponent = (addressComponentType, addressComponents) => (
  addressComponents.find((addressComponent) => (
    addressComponent.types.some((addressComponentTypeMatch) => (
      addressComponentType === addressComponentTypeMatch
    ))
  )) || {}
);

const extractAddressStreetNameVariantsFromGooglePlace = (googlePlace) => (
  lodashCompact([
    findAddressComponent('route', googlePlace.address_components).short_name,
    findAddressComponent('route', googlePlace.address_components).long_name,
  ])
    .reduce((memo, variant) => lodashUniq([...memo, ...variant.split(' ')]), [])
    .filter((variant) => !addressStreetNameVariantBlacklist.includes(variant.toLowerCase()))
);

export function extractListingAddressFieldsFromGooglePlace(googlePlace) {
  typeCheck('googlePlace::NonEmptyObject', googlePlace);

  const listingAddressFields = {
    addressZip: findAddressComponent('postal_code', googlePlace.address_components).short_name,
    addressCity: (
      findAddressComponent('locality', googlePlace.address_components).long_name
      || findAddressComponent('neighborhood', googlePlace.address_components).long_name
    ),
    addressState: findAddressComponent(
      'administrative_area_level_1',
      googlePlace.address_components,
    ).short_name,
    addressStreetNumber: findAddressComponent('street_number', googlePlace.address_components).short_name,
    addressStreetNameVariants: extractAddressStreetNameVariantsFromGooglePlace(googlePlace),
    addressStreetName: findAddressComponent('route', googlePlace.address_components).short_name,
    locationLatitude: googlePlace.geometry.location.lat,
    locationLongitude: googlePlace.geometry.location.lng,
  };

  const isValid = Object.keys(listingAddressFields).every((listingAddressFieldName) => {
    return Array.isArray(listingAddressFields[listingAddressFieldName])
      ? listingAddressFields[listingAddressFieldName].length > 0
      : !!listingAddressFields[listingAddressFieldName];
  });
  return isValid ? listingAddressFields : null;
}

export function extractAddressFieldsFromGooglePlace(googlePlace) {
  typeCheck('googlePlace::NonEmptyObject', googlePlace);

  const addressFields = {
    googlePlaceId: googlePlace.id,
    zip: findAddressComponent('postal_code', googlePlace.address_components).short_name || null,
    city: (
      findAddressComponent('locality', googlePlace.address_components).long_name
      || findAddressComponent('neighborhood', googlePlace.address_components).long_name
      || null
    ),
    stateCode: findAddressComponent(
      'administrative_area_level_1',
      googlePlace.address_components,
    ).short_name || null,
    streetName: findAddressComponent('route', googlePlace.address_components).short_name || null,
    streetNumber: findAddressComponent('street_number', googlePlace.address_components).short_name || null,
    latitude: googlePlace.geometry.location.lat || null,
    longitude: googlePlace.geometry.location.lng || null,
  };

  addressFields.streetDisplay = makeAddressStreetDisplay(addressFields);
  addressFields.display = makeFullAddressDisplay(addressFields);
  addressFields.locationPoint = makeLocationPointString(addressFields);

  return addressFields;
}

export function extractLocationMapCenterFromGooglePlace(googlePlace) {
  typeCheck('googlePlace::Object', googlePlace);
  const locationGeometry = googlePlace.geometry
    ? googlePlace.geometry.location
    : null;

  if (
    locationGeometry
    && typeof locationGeometry.lat === 'function'
    && typeof locationGeometry.lng === 'function'
  ) {
    return {
      lat: locationGeometry.lat(),
      lng: locationGeometry.lng(),
    };
  }

  if (
    locationGeometry
    && locationGeometry.lat
    && locationGeometry.lng
  ) {
    return {
      lat: locationGeometry.lat,
      lng: locationGeometry.lng,
    };
  }

  return null;
}
