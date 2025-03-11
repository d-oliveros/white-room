import type { State } from './address.constants';
import type { IncompleteAddressDto, LocationPointDto } from './address.schemas';

import {
  makeAddressStreetDisplay,
  makeLocationPointString,
  makeAddressCityStateString,
  makeFullAddressDisplay,
  removeSpecialCharacters,
  normalizeAddress,
  extractStreetNumber,
  extractStreetUnitNumber,
  extractZipCode,
  normalizeUnitNumber,
  extractStreetOrientation,
  parseAddressString,
} from './address.helpers';

jest.mock('@namespace/logger');

jest.mock('@namespace/google-client', () => ({
  isGoogleEnabled: true,
  findAddressLocation: jest.fn(),
}));

describe('makeAddressStreetDisplay', () => {
  test('should return null if streetName is not provided', () => {
    const address = {};
    expect(makeAddressStreetDisplay(address)).toBeNull();
  });

  test('should return a properly formatted address string when all parts are provided', () => {
    const address = {
      streetNumber: '123',
      streetPrefix: 'N',
      streetName: 'Main',
      streetSuffix: 'St',
      unitNumber: '4A',
    };
    expect(makeAddressStreetDisplay(address)).toBe('123 N Main St 4A');
  });

  test('should return a properly formatted address string when only streetName is provided', () => {
    const address = {
      streetName: 'Main',
    };
    expect(makeAddressStreetDisplay(address)).toBe('Main');
  });

  test('should handle missing optional address parts', () => {
    const address = {
      streetNumber: '123',
      streetName: 'Main',
      streetSuffix: 'St',
    };
    expect(makeAddressStreetDisplay(address)).toBe('123 Main St');
  });

  test('should trim and join the address parts correctly', () => {
    const address = {
      streetNumber: '  123  ',
      streetPrefix: ' N  ',
      streetName: '  Main  ',
      streetSuffix: '  St  ',
      unitNumber: '  4A  ',
    };
    expect(makeAddressStreetDisplay(address)).toBe('123 N Main St 4A');
  });

  test('should return null for an empty address object', () => {
    const address = {};
    expect(makeAddressStreetDisplay(address)).toBeNull();
  });

  test('should handle null and undefined values gracefully', () => {
    const address = {
      streetNumber: null,
      streetPrefix: undefined,
      streetName: 'Main',
      streetSuffix: null,
      unitNumber: undefined,
    };

    expect(makeAddressStreetDisplay(address)).toBe('Main');
  });

  test('should handle null if values are provided except street name', () => {
    const address = {
      streetNumber: '123',
      streetPrefix: 'N',
      streetSuffix: 'St',
      unitNumber: '4A',
    };
    expect(makeAddressStreetDisplay(address)).toBeNull();
  });
});

describe('makeLocationPointString', () => {
  test('should return null if longitude is not a number', () => {
    const location = { longitude: NaN, latitude: 45.12345 };
    expect(makeLocationPointString(location)).toBeNull();
  });

  test('should return null if latitude is not a number', () => {
    const location = { longitude: -93.12345, latitude: NaN };
    expect(makeLocationPointString(location)).toBeNull();
  });

  test('should return null if longitude is missing', () => {
    const location = { latitude: 45.12345 } as LocationPointDto;
    expect(makeLocationPointString(location)).toBeNull();
  });

  test('should return null if latitude is missing', () => {
    const location = { longitude: -93.12345 } as LocationPointDto;
    expect(makeLocationPointString(location)).toBeNull();
  });

  test('should return null if location object is empty', () => {
    const location = {} as LocationPointDto;
    expect(makeLocationPointString(location)).toBeNull();
  });

  test('should return Point string if longitude and latitude are valid numbers', () => {
    const location = { longitude: -93.12345, latitude: 45.12345 };
    expect(makeLocationPointString(location)).toBe('Point(-93.12345 45.12345)');
  });

  test('should handle extreme valid values for longitude and latitude', () => {
    const location = { longitude: 180, latitude: 90 };
    expect(makeLocationPointString(location)).toBe('Point(180 90)');
  });

  test('should handle negative values for longitude and latitude', () => {
    const location = { longitude: -180, latitude: -90 };
    expect(makeLocationPointString(location)).toBe('Point(-180 -90)');
  });
});

describe('makeAddressCityStateString', () => {
  test('should return null if both city and stateCode are not provided', () => {
    const address = {};
    expect(makeAddressCityStateString(address)).toBe(null);
  });

  test('should return only the city if stateCode and zip are not provided', () => {
    const address = { city: 'New York' };
    expect(makeAddressCityStateString(address)).toBe('New York');
  });

  test('should return only the stateCode and zip if city is not provided', () => {
    const address = { stateCode: 'NY', zip: '10001' } as IncompleteAddressDto;
    expect(makeAddressCityStateString(address)).toBe('NY 10001');
  });

  test('should return city, stateCode, and zip properly formatted', () => {
    const address = { city: 'New York', stateCode: 'NY', zip: '10001' } as IncompleteAddressDto;
    expect(makeAddressCityStateString(address)).toBe('New York, NY 10001');
  });

  test('should handle leading and trailing spaces in city, stateCode, and zip', () => {
    const address = {
      city: '  New York  ',
      stateCode: '  NY  ',
      zip: '  10001  ',
    } as unknown as IncompleteAddressDto;
    expect(makeAddressCityStateString(address)).toBe('New York, NY 10001');
  });

  test('should handle missing optional parts gracefully', () => {
    const address = { city: 'Los Angeles', stateCode: 'CA' } as IncompleteAddressDto;
    expect(makeAddressCityStateString(address)).toBe('Los Angeles, CA');
  });

  test('should handle null and undefined values gracefully', () => {
    const address = {
      city: null,
      stateCode: undefined,
      zip: '90210',
    };
    expect(makeAddressCityStateString(address)).toBe('90210');
  });

  test('should trim and join the address parts correctly when all parts are missing except stateCode', () => {
    const address = { stateCode: 'CA' } as IncompleteAddressDto;
    expect(makeAddressCityStateString(address)).toBe('CA');
  });

  test('should trim and join the address parts correctly when all parts are missing except zip', () => {
    const address = { zip: '90210' };
    expect(makeAddressCityStateString(address)).toBe('90210');
  });
});

describe('makeFullAddressDisplay', () => {
  test('should return null if both street display and city state string are not provided', () => {
    const address = {};
    expect(makeFullAddressDisplay(address)).toBeNull();
  });

  test('should return only the street display if city and stateCode are not provided', () => {
    const address = {
      streetNumber: '123',
      streetName: 'Main',
      streetSuffix: 'St',
    };
    expect(makeFullAddressDisplay(address)).toBe('123 Main St');
  });

  test('should return only the city state string if streetName is not provided', () => {
    const address = { city: 'New York', stateCode: 'NY', zip: '10001' } as IncompleteAddressDto;
    expect(makeFullAddressDisplay(address)).toBe('New York, NY 10001');
  });

  test('should return full address display properly formatted', () => {
    const address = {
      streetNumber: '123',
      streetPrefix: 'N',
      streetName: 'Main',
      streetSuffix: 'St',
      unitNumber: '4A',
      city: 'New York',
      stateCode: 'NY',
      zip: '10001',
    } as IncompleteAddressDto;
    expect(makeFullAddressDisplay(address)).toBe('123 N Main St 4A, New York, NY 10001');
  });

  test('should handle leading and trailing spaces in all parts of the address', () => {
    const address = {
      streetNumber: '  123  ',
      streetPrefix: '  N  ',
      streetName: '  Main  ',
      streetSuffix: '  St  ',
      unitNumber: '  4A  ',
      city: '  New York  ',
      stateCode: '  NY  ',
      zip: '  10001  ',
    } as unknown as IncompleteAddressDto;
    expect(makeFullAddressDisplay(address)).toBe('123 N Main St 4A, New York, NY 10001');
  });

  test('should handle missing optional parts gracefully', () => {
    const address = {
      streetNumber: '123',
      streetName: 'Main',
      city: 'Los Angeles',
      stateCode: 'CA',
    } as IncompleteAddressDto;
    expect(makeFullAddressDisplay(address)).toBe('123 Main, Los Angeles, CA');
  });

  test('should handle null and undefined values gracefully', () => {
    const address = {
      streetNumber: '123',
      streetName: 'Main',
      unitNumber: null,
      city: undefined,
      stateCode: 'CA',
      zip: '90210',
    } as IncompleteAddressDto;
    expect(makeFullAddressDisplay(address)).toBe('123 Main, CA 90210');
  });
});

describe('removeSpecialCharacters', () => {
  test('should remove special characters from a given string', () => {
    const addressLine = '123 Main St. Apt #4!';
    expect(removeSpecialCharacters(addressLine)).toBe('123 Main St Apt 4');
  });

  test('should handle an empty string', () => {
    const addressLine = '';
    expect(removeSpecialCharacters(addressLine)).toBe('');
  });

  test('should handle a string with only special characters', () => {
    const addressLine = '!@#$%^&*()';
    expect(removeSpecialCharacters(addressLine)).toBe('');
  });

  test('should retain alphanumeric characters and spaces', () => {
    const addressLine = 'Apt 123 Main St';
    expect(removeSpecialCharacters(addressLine)).toBe('Apt 123 Main St');
  });

  test('should handle a string with mixed special and alphanumeric characters', () => {
    const addressLine = 'Apt #123, Main St.';
    expect(removeSpecialCharacters(addressLine)).toBe('Apt 123 Main St');
  });

  test('should handle strings with special characters at the beginning and end', () => {
    const addressLine = '!123 Main St!';
    expect(removeSpecialCharacters(addressLine)).toBe('123 Main St');
  });

  test('should not remove .5', () => {
    const addressLine = '!123 Main St! Unit 3.5';
    expect(removeSpecialCharacters(addressLine)).toBe('123 Main St Unit 3.5');
  });
});

describe('normalizeAddress', () => {
  const defaults = {
    streetNumber: null,
    streetPrefix: null,
    streetName: null,
    streetSuffix: null,
    unitNumber: null,
    city: null,
    stateCode: null,
    zip: null,
    countryCode: 'US',
    county: null,
    streetDisplay: null,
    display: null,
  };

  test('should capitalize and clean streetName, streetSuffix, city, and stateCode', () => {
    const address = {
      streetName: 'main street',
      streetSuffix: 'st',
      city: 'new york',
      stateCode: 'ny' as State,
      countryCode: 'us',
    };

    const expected = {
      ...defaults,
      streetName: 'Main Street',
      streetSuffix: 'St',
      city: 'New York',
      stateCode: 'NY',
      countryCode: 'US',
      streetDisplay: 'Main Street St',
      display: 'Main Street St, New York, NY',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should remove special characters from streetName, streetSuffix, city, and unitNumber', () => {
    const address = {
      streetName: 'Main.!',
      streetSuffix: 'St!',
      city: 'New York!!',
      unitNumber: '#4A',
    };
    const expected = {
      ...defaults,
      streetName: 'Main',
      streetSuffix: 'St',
      city: 'New York',
      unitNumber: '4A',
      streetDisplay: 'Main St 4A',
      display: 'Main St 4A, New York',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should support half-units .5', () => {
    const address = {
      streetName: 'Main.!',
      streetSuffix: 'St!',
      city: 'New York!!',
      unitNumber: '4.5',
    };
    const expected = {
      ...defaults,
      streetName: 'Main',
      streetSuffix: 'St',
      city: 'New York',
      unitNumber: '4.5',
      streetDisplay: 'Main St 4.5',
      display: 'Main St 4.5, New York',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should extract and normalize streetPrefix from streetName if not provided', () => {
    const address = {
      streetName: 'N Main Street',
    };
    const expected = {
      ...defaults,
      streetName: 'Main',
      streetSuffix: 'St',
      streetPrefix: 'N',
      streetDisplay: 'N Main St',
      display: 'N Main St',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should remove unitNumber from streetName if present', () => {
    const address = {
      streetName: 'Main St 4A',
      unitNumber: '4A',
    };
    const expected = {
      ...defaults,
      streetName: 'Main',
      streetSuffix: 'St',
      unitNumber: '4A',
      streetDisplay: 'Main St 4A',
      display: 'Main St 4A',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should remove half unitNumber from streetName if present', () => {
    const address = {
      streetName: 'Main St 4.5A',
      unitNumber: '4.5A',
    };
    const expected = {
      ...defaults,
      streetName: 'Main',
      streetSuffix: 'St',
      unitNumber: '4.5A',
      streetDisplay: 'Main St 4.5A',
      display: 'Main St 4.5A',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should extract and normalize streetSuffix from streetName if not provided', () => {
    const address = {
      streetName: 'Main Street St',
    };
    const expected = {
      ...defaults,
      streetName: 'Main Street',
      streetSuffix: 'St',
      streetDisplay: 'Main Street St',
      display: 'Main Street St',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should handle missing streetName gracefully', () => {
    const address = {
      streetPrefix: 'N',
      streetSuffix: 'St',
    };
    const expected = {
      ...defaults,
      streetName: 'N',
      streetPrefix: null,
      streetSuffix: 'St',
      streetDisplay: 'N St',
      display: 'N St',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should generate the correct streetDisplay and display properties', () => {
    const address = {
      streetNumber: '123',
      streetPrefix: 'N',
      streetName: 'Main',
      streetSuffix: 'St',
      unitNumber: '4A',
      city: 'New York',
      stateCode: 'NY',
      zip: '10001',
      countryCode: 'US',
    } as IncompleteAddressDto;
    const expected = {
      ...defaults,
      streetNumber: '123',
      streetPrefix: 'N',
      streetName: 'Main',
      streetSuffix: 'St',
      unitNumber: '4A',
      city: 'New York',
      stateCode: 'NY',
      zip: '10001',
      countryCode: 'US',
      streetDisplay: '123 N Main St 4A',
      display: '123 N Main St 4A, New York, NY 10001',
    };
    expect(normalizeAddress(address)).toEqual(expected);
  });

  test('should make the display address string', () => {
    const address = {
      city: 'Kalamazoo',
      stateCode: 'MI',
      zip: '49006',
      unitNumber: null,
      streetName: 'Jack Pine',
      streetNumber: '1246',
      display: '1246 Jack Pine Way',
      countryCode: 'US',
    } as IncompleteAddressDto;

    const normalizeAddressResult = normalizeAddress(address);
    expect(normalizeAddressResult.display).toBe('1246 Jack Pine, Kalamazoo, MI 49006');
  });

  test('should handle addresses with orientation already in streetPrefix', () => {
    const address = {
      streetNumber: '5218',
      streetPrefix: 'N',
      streetName: 'Cypress Street',
      unitNumber: '1',
      city: 'Bel Aire',
      stateCode: 'KS',
      zip: '67226',
    } as IncompleteAddressDto;

    const result = normalizeAddress(address);

    expect(result).toEqual({
      streetNumber: '5218',
      streetPrefix: 'N',
      streetName: 'Cypress',
      streetSuffix: 'St',
      unitNumber: '1',
      city: 'Bel Aire',
      stateCode: 'KS',
      zip: '67226',
      countryCode: 'US',
      streetDisplay: '5218 N Cypress St 1',
      display: '5218 N Cypress St 1, Bel Aire, KS 67226',
      county: null,
    });
  });

  test('should handle addresses with full orientation names', () => {
    const address = {
      streetNumber: '5218',
      streetName: 'Northwest Cypress Street',
      unitNumber: '1',
      city: 'Bel Aire',
      stateCode: 'KS',
      zip: '67226',
    } as IncompleteAddressDto;

    const result = normalizeAddress(address);

    expect(result).toEqual({
      streetNumber: '5218',
      streetPrefix: 'NW',
      streetName: 'Cypress',
      streetSuffix: 'St',
      unitNumber: '1',
      city: 'Bel Aire',
      stateCode: 'KS',
      zip: '67226',
      countryCode: 'US',
      streetDisplay: '5218 NW Cypress St 1',
      display: '5218 NW Cypress St 1, Bel Aire, KS 67226',
      county: null,
    });
  });

  test('should handle addresses with orientation in both streetPrefix and streetName', () => {
    const address = {
      streetNumber: '5218',
      streetPrefix: 'N',
      streetName: 'North Cypress Street',
      unitNumber: '1',
      city: 'Bel Aire',
      stateCode: 'KS',
      zip: '67226',
    } as IncompleteAddressDto;

    const result = normalizeAddress(address);

    expect(result).toEqual({
      streetNumber: '5218',
      streetPrefix: 'N',
      streetName: 'Cypress',
      streetSuffix: 'St',
      unitNumber: '1',
      city: 'Bel Aire',
      stateCode: 'KS',
      zip: '67226',
      countryCode: 'US',
      streetDisplay: '5218 N Cypress St 1',
      display: '5218 N Cypress St 1, Bel Aire, KS 67226',
      county: null,
    });
  });
});

describe('extractStreetNumber', () => {
  test('should return null if streetName is not provided', () => {
    expect(extractStreetNumber(null)).toBeNull();
    expect(extractStreetNumber(undefined)).toBeNull();
  });

  test('should return the first word as the street number', () => {
    const streetName = '123 Main St';
    expect(extractStreetNumber(streetName)).toBe('123');
  });

  test('should handle street names with multiple spaces', () => {
    const streetName = '  123   Main  St ';
    expect(extractStreetNumber(streetName)).toBe('123');
  });

  test('should return null if the street name does not start with a number', () => {
    const streetName = 'Main St';
    expect(extractStreetNumber(streetName)).toBeNull();
  });

  test('should handle street names with special characters', () => {
    const streetName = '123! Main St';
    expect(extractStreetNumber(streetName)).toBe('123');
  });
});

describe('extractStreetUnitNumber', () => {
  test('should return null if streetName is not provided', () => {
    expect(extractStreetUnitNumber(null)).toBeNull();
    expect(extractStreetUnitNumber(undefined)).toBeNull();
  });

  test('should extract unit number if keyword is present', () => {
    const streetName = '123 Main St Apt 4A';
    expect(extractStreetUnitNumber(streetName)).toBe('4A');
  });

  test('should extract unit number if keyword is not present', () => {
    const streetName = '123 Main St 4';
    expect(extractStreetUnitNumber(streetName)).toBe('4');
  });

  test('should extract unit number if keyword is not present', () => {
    const streetName = '123 Main St 4612';
    expect(extractStreetUnitNumber(streetName)).toBe('4612');
  });

  test('should extract unit number if keyword is not present', () => {
    const streetName = '123 Main St 46126';
    expect(extractStreetUnitNumber(streetName)).toBe(null);
  });

  test('should extract unit number variation 1', () => {
    const streetName = '123 Main St A 515';
    expect(extractStreetUnitNumber(streetName)).toBe('515A');
  });

  test('should extract unit number variation 2', () => {
    const streetName = '123 Main St A515';
    expect(extractStreetUnitNumber(streetName)).toBe('515A');
  });

  test('should extract unit number variation 3', () => {
    const streetName = '123 Main St #A515';
    expect(extractStreetUnitNumber(streetName)).toBe('515A');
  });

  test('should extract unit number variation 4', () => {
    const streetName = '123 Main St #A-515';
    expect(extractStreetUnitNumber(streetName)).toBe('515A');
  });

  test('should extract unit number variation 5', () => {
    const streetName = '123 Main St #A 515';
    expect(extractStreetUnitNumber(streetName)).toBe('515A');
  });

  test('should extract unit number variation 6', () => {
    const streetName = '123 Main St 515B';
    expect(extractStreetUnitNumber(streetName)).toBe('515B');
  });

  test('should extract unit number variation 7', () => {
    const streetName = '123 Main St 515 B';
    expect(extractStreetUnitNumber(streetName)).toBe('515B');
  });

  test('should extract unit number variation 8', () => {
    const streetName = '123 Main St #515-B';
    expect(extractStreetUnitNumber(streetName)).toBe('515B');
  });

  test('should extract unit number variation 9', () => {
    const streetName = '123 Main St #515 NE';
    expect(extractStreetUnitNumber(streetName)).toBe('515');
  });

  test('should extract unit number variation 10', () => {
    const streetName = '123 Main St #515-B';
    expect(extractStreetUnitNumber(streetName)).toBe('515B');
  });

  test('should extract unit number variation 11', () => {
    const streetName = '123 Main St B';
    expect(extractStreetUnitNumber(streetName)).toBe('B');
  });

  test('should return null if no unit number exists', () => {
    const streetName = '123 Main St';
    expect(extractStreetUnitNumber(streetName)).toBeNull();
  });

  test('should handle mixed case keywords', () => {
    const streetName = '123 Main St aPt 4A';
    expect(extractStreetUnitNumber(streetName)).toBe('4A');
  });

  test('should handle street names with special characters', () => {
    const streetName = '123 Main St Apt #4A!';
    expect(extractStreetUnitNumber(streetName)).toBe('4A');
  });

  test('should preserve .5', () => {
    const streetName = '123 Main St Apt 6.5!';
    expect(extractStreetUnitNumber(streetName)).toBe('6.5');
  });

  test("should return null if keyword doesn't exits", () => {
    const streetNames = ['223 E Mill St', '32011 N 125th Ave'];

    for (const streetName of streetNames) {
      const extractStreetUnitNumberResult = extractStreetUnitNumber(streetName);
      expect(extractStreetUnitNumberResult).toBeNull();
    }
  });

  test('should extract the unit number from the street when a keyword exists', () => {
    const streetAddresses = [
      ['#144', '144'],
      ['Unit A', 'A'],
      ['526 11th Street Unit 5', '5'],
      ['7638 S Redwood Rd # 14 West Jordan, UT 84084', '14'],
      ['44 E Roanoke Ave Apt 4', '4'],
      ['526 11th Street Unit 5 Imperial Beach, CA 91932', '5'],
      ['2620 Worden St #169', '169'],
      ['1070 Felspar Street #1 San Diego, CA 92109', '1'],
      ['4423 52nd Street #2D San Diego, CA 92115', '2D'],
      ['3351 India Street - Unit A San Diego, CA 92103', 'A'],
      ['929 Morreene Rd Apt A13', '13A'],
      ['929 Morreene Rd Apt D33', '33D'],
      ['6 W Chestnut Street Unit C Hanover, PA 17331', 'C'],
    ];

    for (const [streetName, expectedUnitNumber] of streetAddresses) {
      const extractStreetUnitNumberResult = extractStreetUnitNumber(streetName);
      expect(extractStreetUnitNumberResult).toBe(expectedUnitNumber);
    }
  });
});

describe('extractZipCode', () => {
  test('should return null if zipCode is not provided', () => {
    expect(extractZipCode(null)).toBeNull();
    expect(extractZipCode(undefined)).toBeNull();
  });

  test('should extract only the first 5 digits of the zip code', () => {
    const zipCode = '10001-1234';
    expect(extractZipCode(zipCode)).toBe('10001');
  });

  test('should handle zip codes with special characters', () => {
    const zipCode = '10001!@#$';
    expect(extractZipCode(zipCode)).toBe('10001');
  });

  test('should handle zip codes with spaces', () => {
    const zipCode = ' 10001 ';
    expect(extractZipCode(zipCode)).toBe('10001');
  });

  test('should return null if zip code contains no digits', () => {
    const zipCode = 'ABCDE';
    expect(extractZipCode(zipCode)).toBeNull();
  });

  test('should return null if it contains less than 5 digits', () => {
    const zipCode = '123';
    expect(extractZipCode(zipCode)).toBeNull();
  });
});

describe('normalizeUnitNumber', () => {
  test('should return null if unitNumber is not provided', () => {
    expect(normalizeUnitNumber(null)).toBeNull();
    expect(normalizeUnitNumber(undefined)).toBeNull();
  });

  test('should remove special characters from the unit number', () => {
    const unitNumber = 'Apt #4A!';
    expect(normalizeUnitNumber(unitNumber)).toBe('4A');
  });

  test('should remove alphabetical characters longer than one letter', () => {
    const unitNumber = 'Unit 4A';
    expect(normalizeUnitNumber(unitNumber)).toBe('4A');
  });

  test('should handle unit numbers with multiple spaces', () => {
    const unitNumber = '  4A  ';
    expect(normalizeUnitNumber(unitNumber)).toBe('4A');
  });

  test('should convert unit number to uppercase', () => {
    const unitNumber = '4a';
    expect(normalizeUnitNumber(unitNumber)).toBe('4A');
  });

  test('should handle unit numbers with mixed characters', () => {
    const unitNumber = ' Apt #4a!';
    expect(normalizeUnitNumber(unitNumber)).toBe('4A');
  });
});

describe('extractStreetOrientation', () => {
  const address = {
    streetNumber: '605',
    unitNumber: 'B',
    streetName: 'South',
    streetPrefix: 'W',
    streetSuffix: 'St',
    city: 'Leander',
    stateCode: 'TX',
    zip: '78641',
    streetDisplay: '605 W South St B',
    display: '605 W South St B, Leander, TX 78641',
  };

  test('should extract street orientation from streetPrefix', () => {
    expect(extractStreetOrientation(address.streetDisplay)).toBe('w');
  });

  test('should extract street orientation from streetName', () => {
    const modifiedAddress = {
      ...address,
      streetPrefix: null,
      streetDisplay: '605 South St B',
    };
    expect(extractStreetOrientation(modifiedAddress.streetDisplay)).toBe('south');
  });

  test('should return null when no orientation is present', () => {
    const modifiedAddress = {
      ...address,
      streetPrefix: null,
      streetName: 'Main',
      streetDisplay: '605 Main St B',
    };
    expect(extractStreetOrientation(modifiedAddress.streetDisplay)).toBeNull();
  });

  test('should handle multiple orientations and return the first one', () => {
    const modifiedAddress = {
      ...address,
      streetDisplay: '605 W South St NE B',
    };
    expect(extractStreetOrientation(modifiedAddress.streetDisplay)).toBe('w');
  });

  test('should be case-insensitive', () => {
    const modifiedAddress = { ...address, streetDisplay: '605 w SOUTH St B' };
    expect(extractStreetOrientation(modifiedAddress.streetDisplay)).toBe('w');
  });

  test('should handle full orientation names', () => {
    const modifiedAddress = {
      ...address,
      streetPrefix: 'West',
      streetDisplay: '605 West South St B',
    };
    expect(extractStreetOrientation(modifiedAddress.streetDisplay)).toBe('west');
  });

  test('should handle orientation at the end of the street name', () => {
    const modifiedAddress = {
      ...address,
      streetPrefix: null,
      streetName: 'Park',
      streetSuffix: 'Ave',
      streetDisplay: '605 Park Ave S',
    };
    expect(extractStreetOrientation(modifiedAddress.streetDisplay)).toBe('s');
  });

  test('should return null for addresses without orientation', () => {
    expect(extractStreetOrientation('123 Main St')).toBeNull();
  });

  test('should handle addresses with numbers that could be confused with orientations', () => {
    expect(extractStreetOrientation('1 North St')).toBe('north');
    expect(extractStreetOrientation('100 West Ave')).toBe('west');
  });
});

describe('parseAddressString', () => {
  test('should parse a basic address correctly', () => {
    const result = parseAddressString('123 Main St, Boston, MA 02108');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '123',
        streetName: 'Main',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: null,
        city: 'Boston',
        stateCode: 'MA' as State,
        zip: '02108',
      }),
    );
  });

  test('should handle address with unit number', () => {
    const result = parseAddressString('456 Washington Ave Apt 2B, Chicago, IL 60601');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '456',
        streetName: 'Washington',
        streetSuffix: 'Ave',
        streetPrefix: null,
        unitNumber: '2B',
        city: 'Chicago',
        stateCode: 'IL' as State,
        zip: '60601',
      }),
    );
  });

  test('should handle address with street prefix', () => {
    const result = parseAddressString('789 N Michigan Blvd, Chicago, IL 60611');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '789',
        streetName: 'Michigan',
        streetSuffix: 'Blvd',
        streetPrefix: 'N',
        unitNumber: null,
        city: 'Chicago',
        stateCode: 'IL' as State,
        zip: '60611',
      }),
    );
  });

  test('should handle unit number in street name', () => {
    const expected = normalizeAddress({
      streetNumber: '1010',
      streetName: 'Park',
      streetSuffix: 'Ave',
      streetPrefix: null,
      unitNumber: '15A',
      city: 'New York',
      stateCode: 'NY' as State,
      zip: '10028',
    });

    expect(parseAddressString('1010 Park Avenue 15A, New York, NY 10028')).toEqual(expected);
    expect(parseAddressString('1010 Park Avenue 15 A, New York, NY 10028')).toEqual(expected);
    expect(parseAddressString('1010 Park Avenue A-15, New York, NY 10028')).toEqual(expected);
    expect(parseAddressString('1010 Park Avenue A15, New York, NY 10028')).toEqual(expected);
  });

  test('should handle hyphenated street names', () => {
    const result = parseAddressString('222 Winston-Salem Rd, Durham, NC 27707');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '222',
        streetName: 'Winston-Salem',
        streetSuffix: 'Rd',
        streetPrefix: null,
        unitNumber: null,
        city: 'Durham',
        stateCode: 'NC' as State,
        zip: '27707',
      }),
    );
  });

  test('should handle multiple word city names', () => {
    const result = parseAddressString('555 Ocean Dr, West Palm Beach, FL 33401');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '555',
        streetName: 'Ocean',
        streetSuffix: 'Dr',
        streetPrefix: null,
        unitNumber: null,
        city: 'West Palm Beach',
        stateCode: 'FL' as State,
        zip: '33401',
      }),
    );
  });

  test('should handle address with suite number', () => {
    const result = parseAddressString('100 Pine Street Suite 300, San Francisco, CA 94111');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '100',
        streetName: 'Pine',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: '300',
        city: 'San Francisco',
        stateCode: 'CA' as State,
        zip: '94111',
      }),
    );
  });

  test('should handle address with pound sign unit', () => {
    const result = parseAddressString('742 Evergreen Terrace #4, Springfield, OR 97477');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '742',
        streetName: 'Evergreen',
        streetSuffix: 'Ter',
        streetPrefix: null,
        unitNumber: '4',
        city: 'Springfield',
        stateCode: 'OR' as State,
        zip: '97477',
      }),
    );
  });

  test('should handle address with multiple directionals', () => {
    const result = parseAddressString('303 SW 2nd Ave, Portland, OR 97204');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '303',
        streetName: '2nd',
        streetSuffix: 'Ave',
        streetPrefix: 'SW',
        unitNumber: null,
        city: 'Portland',
        stateCode: 'OR' as State,
        zip: '97204',
      }),
    );
  });

  test('should handle address with ordinal street name', () => {
    const result = parseAddressString('1600 3rd Avenue, Seattle, WA 98101');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '1600',
        streetName: '3rd',
        streetSuffix: 'Ave',
        streetPrefix: null,
        unitNumber: null,
        city: 'Seattle',
        stateCode: 'WA' as State,
        zip: '98101',
      }),
    );
  });

  test('should return null for PO Box addresses', () => {
    const result = parseAddressString('PO Box 12345, Austin, TX 78701');
    expect(result).toEqual(null);
  });

  test('should handle address with floor number', () => {
    const result = parseAddressString('200 Park Avenue Floor 23, New York, NY 10166');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '200',
        streetName: 'Park',
        streetSuffix: 'Ave',
        streetPrefix: null,
        unitNumber: '23',
        city: 'New York',
        stateCode: 'NY' as State,
        zip: '10166',
      }),
    );
  });

  test('should handle address with unit letter only', () => {
    const result = parseAddressString('123 Main St Unit D, Boston, MA 02108');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '123',
        streetName: 'Main',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: 'D',
        city: 'Boston',
        stateCode: 'MA' as State,
        zip: '02108',
      }),
    );
  });

  test('should handle address with extra spaces', () => {
    const result = parseAddressString(
      '  888   Memorial   Drive   Apt  4C,  Cambridge,  MA  02139  ',
    );
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '888',
        streetName: 'Memorial',
        streetSuffix: 'Dr',
        streetPrefix: null,
        unitNumber: '4C',
        city: 'Cambridge',
        stateCode: 'MA' as State,
        zip: '02139',
      }),
    );
  });

  test('should handle address with missing zip code', () => {
    const result = parseAddressString('123 Main St, Boston, MA');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '123',
        streetName: 'Main',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: null,
        city: 'Boston',
        stateCode: 'MA' as State,
        zip: null,
      }),
    );
  });

  test('should handle address with only street info', () => {
    const result = parseAddressString('789 Pine Street');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '789',
        streetName: 'Pine',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: null,
        city: null,
        stateCode: null,
        zip: null,
      }),
    );
  });

  test('should handle address with missing street number', () => {
    const result = parseAddressString('Maple Avenue, Portland, OR 97201');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: null,
        streetName: 'Maple',
        streetSuffix: 'Ave',
        streetPrefix: null,
        unitNumber: null,
        city: 'Portland',
        stateCode: 'OR' as State,
        zip: '97201',
      }),
    );
  });

  test('should handle address with missing street suffix', () => {
    const result = parseAddressString('321 Washington, Seattle, WA 98101');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '321',
        streetName: 'Washington',
        streetSuffix: null,
        streetPrefix: null,
        unitNumber: null,
        city: 'Seattle',
        stateCode: 'WA' as State,
        zip: '98101',
      }),
    );
  });

  test('should handle address with informal unit number in street name', () => {
    const result = parseAddressString('123 Oak St Unit 4B, Boston, MA 02108');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '123',
        streetName: 'Oak',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: '4B',
        city: 'Boston',
        stateCode: 'MA' as State,
        zip: '02108',
      }),
    );
  });

  test('should handle address with # unit format', () => {
    const result = parseAddressString('456 Elm St #2A, Denver, CO 80202');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '456',
        streetName: 'Elm',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: '2A',
        city: 'Denver',
        stateCode: 'CO' as State,
        zip: '80202',
      }),
    );
  });

  test('should handle address with apartment abbreviation', () => {
    const result = parseAddressString('789 Pine St Apt 3C, Miami, FL 33101');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '789',
        streetName: 'Pine',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: '3C',
        city: 'Miami',
        stateCode: 'FL' as State,
        zip: '33101',
      }),
    );
  });

  test('should handle address with suite format', () => {
    const result = parseAddressString('321 Main St Suite 100, Austin, TX 78701');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '321',
        streetName: 'Main',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: '100',
        city: 'Austin',
        stateCode: 'TX' as State,
        zip: '78701',
      }),
    );
  });

  test('should handle address with no comma separators', () => {
    const result = parseAddressString('555 Market St Unit 7D San Francisco CA 94105');
    expect(result).toEqual(
      normalizeAddress({
        streetNumber: '555',
        streetName: 'Market',
        streetSuffix: 'St',
        streetPrefix: null,
        unitNumber: '7D',
        city: 'San Francisco',
        stateCode: 'CA' as State,
        zip: '94105',
      }),
    );
  });
});
