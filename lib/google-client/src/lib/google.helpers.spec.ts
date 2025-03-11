import type { AddressPartialDto, State } from '@namespace/address-helpers';

import { normalizeAddress } from '@namespace/address-helpers';
import { populateAddressLocationFields } from './google.helpers';
import * as googleClient from './google.client';

const runTestsIfGoogleEnabled = googleClient.isGoogleEnabled ? describe : describe.skip;

runTestsIfGoogleEnabled('Google Helpers', () => {
  describe('populateAddressLocationFields', () => {
    test('should populate the address with location fields', async () => {
      const mockLocation = {
        longitude: -97.7485987,
        latitude: 30.3623537,
        googlePlaceId: 'ChIJ5b3iPAzLRIYRFAi8cQdSZqw',
      };

      jest.spyOn(googleClient, 'findAddressLocation').mockResolvedValue(mockLocation);

      const address = normalizeAddress({
        streetNumber: '3636',
        streetName: 'Executive Center',
        streetSuffix: 'Dr',
        streetPrefix: null,
        unitNumber: null,
        city: 'Austin',
        type: 'address' as const,
        stateCode: 'TX' as State,
        zip: '78731',
        countryCode: 'US',
      } as AddressPartialDto);

      const populatedAddress = await populateAddressLocationFields(address);

      expect(populatedAddress).toEqual({
        ...address,
        latitude: mockLocation.latitude,
        longitude: mockLocation.longitude,
      });
    });
  });
});
