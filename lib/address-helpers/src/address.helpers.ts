import type { State } from './address.constants';
import type {
  IncompleteAddressDto,
  AddressPartialDto,
  AddressParsedDto,
  LocationPointDto,
  AddressParserResult,
} from './address.schemas';

import { AddressParser } from '@sroussey/parse-address';

import {
  AddressType,
  streetSuffixMapping,
  allStreetSuffixes,
  streetOrientationAbbreviations,
  streetOrientationAbbreviationsReversed,
  streetOrientationAbbreviationsShortList,
} from './address.constants';

const unwantedTokensRegex = /unit|apartment|apt|suite/gi;
const unitKeywords = ['apt', 'unit'];
const addressParser = new AddressParser();

export function makeAddressStreetDisplay(address: IncompleteAddressDto): string | null {
  if (!address?.streetName) {
    return null;
  }

  const addressStreet = [
    address.streetNumber || '',
    address.streetPrefix || '',
    address.streetName || '',
    address.streetSuffix || '',
    address.unitNumber || '',
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(' ');

  return addressStreet;
}

export function makeLocationPointString(location: LocationPointDto): string | null {
  const locationPointIsValid =
    typeof location.longitude === 'number' &&
    !isNaN(location.longitude) &&
    typeof location.latitude === 'number' &&
    !isNaN(location.latitude);

  const listingLocationPointString = locationPointIsValid
    ? `Point(${location.longitude} ${location.latitude})`
    : null;

  return listingLocationPointString;
}

export function makeAddressCityStateString(address: IncompleteAddressDto): string | null {
  if (!address?.city && !address?.stateCode && !address?.zip) {
    return null;
  }

  return [
    (address.city || '').trim(),
    [address.stateCode || '', address.zip || '']
      .map((value) => value.trim())
      .filter(Boolean)
      .join(' ')
      .trim(),
  ]
    .filter(Boolean)
    .join(', ');
}

export function makeFullAddressDisplay(address: IncompleteAddressDto): string | null {
  const fullAddressString = [makeAddressStreetDisplay(address), makeAddressCityStateString(address)]
    .filter(Boolean)
    .join(', ');

  return fullAddressString || null;
}

export function removeSpecialCharacters(addressLine: string): string {
  if (typeof addressLine !== 'string') {
    return '';
  }
  return addressLine.replace(/(?!\.5)[^A-Za-zÀ-ÿñÑ\d\s]/g, '');
}

export function removeStreetNumberFromStreetName(streetName: string): string {
  return streetName.replace(/^\d+/, '').trim();
}

export function normalizeAddress(address: IncompleteAddressDto): IncompleteAddressDto;
export function normalizeAddress(address: AddressPartialDto): AddressParsedDto;
export function normalizeAddress(
  address: IncompleteAddressDto | AddressPartialDto,
): IncompleteAddressDto | AddressParsedDto {
  const normalizedAddress = {
    ...address,
    streetName:
      capitalizeAllWords(address.streetName || '').replace(unwantedTokensRegex, '') || null,
    streetPrefix: (address.streetPrefix || '').toUpperCase() || null,
    streetSuffix: capitalizeAllWords(address.streetSuffix || '') || null,
    city: capitalizeAllWords(address.city || '') || null,
    county: capitalizeAllWords(address.county || '') || null,
    countryCode: ((address.countryCode || 'US').toUpperCase() as 'US') || null,
    stateCode: ((address.stateCode || '').toUpperCase() as State) || null,
    streetNumber: address.streetNumber || null,
    unitNumber: address.unitNumber ? address.unitNumber.toUpperCase() : null,
    zip: address.zip || null,
  } as IncompleteAddressDto | AddressParsedDto;

  (['streetName', 'streetPrefix', 'streetSuffix', 'city', 'unitNumber'] as const).forEach((key) => {
    if (normalizedAddress[key] && typeof normalizedAddress[key] === 'string') {
      normalizedAddress[key] = removeSpecialCharacters(normalizedAddress[key]);
    }
  });

  // Build a mapping of all orientation variants to their standard abbreviations
  const streetOrientationVariants: { [key: string]: string } = {};
  for (const [fullName, abbreviation] of Object.entries(streetOrientationAbbreviations)) {
    streetOrientationVariants[fullName.toLowerCase()] = abbreviation.toUpperCase();
    streetOrientationVariants[abbreviation.toLowerCase()] = abbreviation.toUpperCase();
  }

  if (normalizedAddress.streetName) {
    if (!normalizedAddress.streetPrefix) {
      const streetParts = normalizedAddress.streetName.split(' ');

      // Check if the first part of the street name is a directional prefix
      const firstPart = streetParts[0]?.toLowerCase();
      const isFirstPartPrefix =
        firstPart && Object.keys(streetOrientationVariants).includes(firstPart);

      // If the first part is a prefix, use it
      if (isFirstPartPrefix) {
        normalizedAddress.streetPrefix = streetOrientationVariants[firstPart];
        normalizedAddress.streetName = streetParts.slice(1).join(' ').trim();
      } else {
        // Otherwise, check any part of the street name (original behavior)
        const streetPrefixPart = streetParts.find(
          (part: string) => streetOrientationVariants[part.toLowerCase()],
        );

        if (streetPrefixPart) {
          normalizedAddress.streetPrefix =
            streetOrientationVariants[streetPrefixPart.toLowerCase()];
          normalizedAddress.streetName = streetParts
            .filter((name) => name !== streetPrefixPart)
            .join(' ')
            .trim();
        }
      }
    } else {
      const streetParts = normalizedAddress.streetName.split(' ');

      const prefixVariants = Object.keys(streetOrientationVariants).filter(
        (key) => streetOrientationVariants[key] === normalizedAddress.streetPrefix,
      );

      normalizedAddress.streetName = streetParts
        .filter((name) => !prefixVariants.includes(name.toLowerCase()))
        .join(' ')
        .trim();
    }

    if (!normalizedAddress.streetNumber) {
      normalizedAddress.streetNumber = extractStreetNumber(normalizedAddress.streetName);
      normalizedAddress.streetName = removeStreetNumberFromStreetName(normalizedAddress.streetName);
    }

    if (!normalizedAddress.unitNumber) {
      const unitNumberExtracted = extractStreetUnitNumber(normalizedAddress.streetName);
      if (unitNumberExtracted) {
        normalizedAddress.streetName = removeUnitNumberFromStreetName(
          unitNumberExtracted,
          normalizedAddress.streetName,
        );
        normalizedAddress.unitNumber = unitNumberExtracted.trim();
      }
    }

    if (normalizedAddress.unitNumber) {
      const lowercasedUnitNumber = normalizedAddress.unitNumber.toLowerCase();
      const streetParts = normalizedAddress.streetName.split(' ');
      const lowercasedLastStreetNamePart = streetParts[streetParts.length - 1].toLowerCase();

      if (lowercasedLastStreetNamePart === lowercasedUnitNumber) {
        normalizedAddress.streetName = streetParts.slice(0, -1).join(' ').trim();
      }
    }

    if (!normalizedAddress.streetSuffix) {
      const streetParts = normalizedAddress.streetName.split(' ');

      const lastStreetPart = streetParts[streetParts.length - 1].toLowerCase();

      if (streetParts.length > 1 && allStreetSuffixes.includes(lastStreetPart)) {
        normalizedAddress.streetName = streetParts.slice(0, -1).join(' ').trim();
        normalizedAddress.streetSuffix = capitalizeAllWords(
          streetSuffixMapping[lastStreetPart as keyof typeof streetSuffixMapping] || lastStreetPart,
        );
      }
    } else {
      const lowercasedSuffix = normalizedAddress.streetSuffix.toLowerCase();
      const streetParts = normalizedAddress.streetName.split(' ');
      const lowercasedLastStreetNamePart = streetParts[streetParts.length - 1].toLowerCase();

      if (lowercasedLastStreetNamePart === lowercasedSuffix) {
        normalizedAddress.streetName = streetParts.slice(0, -1).join(' ').trim();
      }
    }
  }

  if (normalizedAddress.streetSuffix) {
    const lowercaseSuffix =
      normalizedAddress.streetSuffix.toLowerCase() as keyof typeof streetSuffixMapping;
    const shortSuffix = streetSuffixMapping[lowercaseSuffix];
    if (shortSuffix) {
      normalizedAddress.streetSuffix = capitalizeAllWords(shortSuffix);
    }
  }

  if (!normalizedAddress.streetName && normalizedAddress.streetPrefix) {
    normalizedAddress.streetName = normalizedAddress.streetPrefix.trim();
    normalizedAddress.streetPrefix = null;
  }

  // Only add type for AddressParsedDto, not for IncompleteAddressDto
  if ('latitude' in address && 'longitude' in address) {
    if (normalizedAddress.streetName && normalizedAddress.streetNumber) {
      normalizedAddress.type = AddressType.Address;
    } else if (normalizedAddress.latitude && normalizedAddress.longitude) {
      normalizedAddress.type = AddressType.Coordinates;
    }
  }

  if (normalizedAddress.type === AddressType.Coordinates) {
    normalizedAddress.display = address.display || null;
    normalizedAddress.streetDisplay = null;
    normalizedAddress.streetNumber = null;
    normalizedAddress.streetName = null;
    normalizedAddress.streetPrefix = null;
    normalizedAddress.streetSuffix = null;
    normalizedAddress.unitNumber = null;
  } else {
    normalizedAddress.streetDisplay = makeAddressStreetDisplay(normalizedAddress) || undefined;
    normalizedAddress.display = makeFullAddressDisplay(normalizedAddress) || undefined;
  }

  return normalizedAddress;
}

export function extractStreetNumber(streetName: string | null | undefined): string | null {
  if (!streetName) {
    return null;
  }

  const streetNumber = streetName
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')[0]
    .replace(/[^0-9]/g, '');

  return streetNumber || null;
}

export function extractStreetUnitNumber(streetName: string | null | undefined): string | null {
  if (!streetName) {
    return null;
  }

  const streetNameLowercase = streetName.toLowerCase();
  for (const keyword of unitKeywords) {
    if (streetNameLowercase.includes(keyword)) {
      const keywordIndex = streetNameLowercase.indexOf(keyword);
      const unitNumber = streetName.slice(keywordIndex + keyword.length).trim();
      const unitNumberParts = unitNumber.split(' ');

      return normalizeUnitNumber(unitNumberParts[0]);
    }
  }

  const streetNameParts = streetName.trim().split(' ');

  let reverseStreetName =
    streetNameParts.length > 1
      ? removeSpecialCharacters(
          streetName
            .split(' ')
            .slice(1)
            .reverse()
            .filter((part) => {
              return !streetOrientationAbbreviationsShortList.includes(part.toLowerCase());
            })
            .join(' '),
        )
      : streetNameParts[0];

  const reverseStreetNameParts = reverseStreetName.split(' ');
  if (reverseStreetNameParts.length > 1 && reverseStreetNameParts[1]) {
    if (
      (!isNaN(Number(reverseStreetNameParts[0])) &&
        reverseStreetNameParts[0].length < 5 &&
        reverseStreetNameParts[1].match('[A-Za-z]') &&
        reverseStreetNameParts[1].length === 1) ||
      (reverseStreetNameParts[0].match('[A-Za-z]') &&
        reverseStreetNameParts[0].length === 1 &&
        !isNaN(Number(reverseStreetNameParts[1])) &&
        reverseStreetNameParts[1].length < 5)
    ) {
      reverseStreetName = [
        `${reverseStreetNameParts[1]}${reverseStreetNameParts[0]}`,
        ...(reverseStreetNameParts.slice(2) || []),
      ].join(' ');
    }
  }

  // Regex to match ensuring at least one character or digit is present
  // This pattern attempts to match a word boundary, followed by any of:
  // - A single character
  // - 1 to 4 digits
  // - A character possibly preceded or followed by 1 to 4 digits
  // It ensures that there's at least one component present in the match
  const regex = /\b(?:([A-Za-z])|(\d{1,4})|([A-Za-z]?\d{1,4}[A-Za-z]?))\b/;
  const matches = reverseStreetName.match(regex);

  if (matches) {
    // Combine the groups to form the unit number. This accounts for any of the optional components being present.
    const unitNumber = matches[1] || matches[2] || matches[3];
    if (unitNumber) {
      return normalizeUnitNumber(unitNumber);
    }
  }

  return null;
}

function removeUnitNumberFromStreetName(unitNumber: string, streetName: string): string {
  // Normalize unit number by removing spaces and converting to uppercase
  const normalizedUnitNumber = unitNumber.replace(/\s+/g, '').toUpperCase();

  // Create variations of the unit number
  const [letter, number] =
    normalizedUnitNumber.match(/([A-Z])(\d+)/)?.slice(1) ||
    normalizedUnitNumber
      .match(/(\d+)([A-Z])/)
      ?.slice(1)
      .reverse() ||
    [];

  if (!letter || !number) {
    return streetName;
  }

  // Create regex patterns for different unit number formats
  const patterns = [
    `${letter}\\s*${number}`, // A15, A 15
    `${number}\\s*${letter}`, // 15A, 15 A
  ];

  // Remove all variations of the unit number from street name
  let result = streetName;
  patterns.forEach((pattern) => {
    const regex = new RegExp(pattern, 'gi');
    result = result.replace(regex, '');
  });

  return result.trim();
}

export function extractZipCode(zipCode: string | null | undefined): string | null {
  if (!zipCode) {
    return null;
  }

  const cleanedZip = zipCode.replace(/[^0-9]/g, '').trim();

  if (cleanedZip.length < 5) {
    return null;
  }

  return cleanedZip.slice(0, 5);
}

export function extractStreetOrientation(addressDisplay: string | null | undefined): string | null {
  if (!addressDisplay) {
    return null;
  }

  const addressParts = addressDisplay.toLowerCase().split(' ');
  const orientations = [
    ...Object.keys(streetOrientationAbbreviations),
    ...Object.keys(streetOrientationAbbreviationsReversed),
  ];

  for (const addressPart of addressParts) {
    if (orientations.includes(addressPart)) {
      return addressPart;
    }
  }

  // Check for full orientation names
  for (const [fullName] of Object.entries(streetOrientationAbbreviations)) {
    if (addressDisplay.toLowerCase().includes(fullName.toLowerCase())) {
      return fullName.toLowerCase();
    }
  }

  return null;
}

export function normalizeUnitNumber(unitNumber: string | null | undefined): string | null {
  if (!unitNumber || typeof unitNumber !== 'string') {
    return null;
  }

  const cleanedUnitNumber = removeSpecialCharacters(unitNumber)
    .replace(/[A-Za-z]{2,}/g, '')
    .replace(/\s/g, '')
    .toUpperCase()
    .trim();

  // Move any letters to the end
  const letters = cleanedUnitNumber.match(/[A-Z]/g) || [];
  const numbersOnly = cleanedUnitNumber.replace(/[A-Z]/g, '');
  const reorderedUnitNumber = numbersOnly + letters.join('');

  return reorderedUnitNumber || null;
}

function capitalizeAllWords(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function parseAddressString(addressStr: string): IncompleteAddressDto | null {
  addressStr = addressStr.replace(/\s+/g, ' ');

  if (addressStr.toLowerCase().includes('po box')) {
    return null;
  }

  const parsedAddress = addressParser.parseLocation(addressStr) as AddressParserResult;

  if (parsedAddress) {
    return normalizeAddress({
      streetNumber: parsedAddress.number || null,
      streetPrefix: parsedAddress.prefix || null,
      streetName: parsedAddress.street || null,
      streetSuffix: parsedAddress.type || null,
      unitNumber: parsedAddress.sec_unit_num || null,
      city: parsedAddress.city || null,
      stateCode: parsedAddress.state || null,
      zip: parsedAddress.zip || null,
    });
  } else {
    return null;
  }
}
