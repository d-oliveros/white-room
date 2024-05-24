import lodashCompact from 'lodash/fp/compact';
import typeCheck from 'common/util/typeCheck';
import capitalizeAll from 'common/util/capitalizeAll';

export function makeAddressStreetDisplay(address, { omitUnitWord, omitUnitNumber } = {}) {
  if (!address?.streetName) {
    return null;
  }

  const addressStreet = lodashCompact([
    address.streetNumber || '',
    address.streetPrefix || '',
    address.streetName,
    address.streetSuffix || '',
  ]).join(' ').trim();

  const addressUnitNumber = address.unitNumber;

  if (!addressUnitNumber || omitUnitNumber) {
    return addressStreet;
  }

  if (typeof omitUnitWord === 'boolean' && !omitUnitWord) {
    return `${addressStreet}, Unit ${addressUnitNumber}`;
  }

  return `${addressStreet} ${addressUnitNumber}`;
}

export function makeLocationPointString(location) {
  typeCheck('location::NonEmptyObject', location);

  const locationPointIsValid = (
    typeof location.longitude === 'number'
    && !isNaN(location.longitude)
    && typeof location.latitude === 'number'
    && !isNaN(location.latitude)
  );

  const listingLocationPointString = locationPointIsValid
    ? `Point(${location.longitude} ${location.latitude})`
    : null;

  return listingLocationPointString;
}

export function makeAddressCityStateString(address = {}) {
  return lodashCompact([
    (address.city || '').trim(),
    `${address.stateCode || ''} ${address.zip || ''}`.trim(),
  ]).join(', ');
}

export function makeFullAddressDisplay(address) {
  const fullAddressString = lodashCompact([
    makeAddressStreetDisplay(address),
    makeAddressCityStateString(address),
  ]).join(', ');

  return fullAddressString || null;
}

export function beautifyAddress(address) {
  if (!address) {
    return null;
  }

  const beautifiedAddress = {
    ...address,
    streetName: capitalizeAll(address.streetName || '') || null,
    streetSuffix: capitalizeAll(address.streetSuffix || '') || null,
    streetDisplay: capitalizeAll(address.streetDisplay || '') || null,
    city: capitalizeAll(address.city || '') || null,
    countryCode: (address.countryCode || '').toUpperCase() || null,
    stateCode: (address.stateCode || '').toUpperCase() || null,
    unitNumber: (address.unitNumber || '').toUpperCase() || null,
    display: capitalizeAll(address.display || '') || null,
  };

  return beautifiedAddress;
}
