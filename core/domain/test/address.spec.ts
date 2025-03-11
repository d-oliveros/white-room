import type { AddressPartialDto } from '@namespace/address-helpers';
import { TestService } from './lib/TestService';

describe('Address Service', () => {
  const testService = new TestService({ context: 'domain' });

  beforeAll(async () => {
    await testService.initDataSource();
    await testService.resetData();
  });

  afterAll(async () => {
    await testService.destroyDataSource();
  });

  test('create and get address', async () => {
    const {
      domain: {
        address: { addressService },
      },
    } = testService;

    const addressData = {
      streetNumber: '123',
      streetName: 'Test St',
      city: 'Testville',
      stateCode: 'FL',
      countryCode: 'US',
      zip: '12345',
      latitude: 25.7617,
      longitude: -80.1918,
    } as AddressPartialDto;

    const expectedAddressData = {
      ...addressData,
      streetName: 'Test',
      streetSuffix: 'St',
    };

    const createdAddress = await addressService.getOrCreate(addressData);
    expect(createdAddress).toBeDefined();
    expect(createdAddress.streetName).toBe(expectedAddressData.streetName);

    const fetchedAddress = await addressService.getById(createdAddress.id);
    expect(fetchedAddress).toBeDefined();
    expect(fetchedAddress?.id).toBe(createdAddress.id);
  });

  test('get existing address by address parts', async () => {
    const {
      domain: {
        address: { addressService },
      },
    } = testService;
    const addressData = {
      streetNumber: '123',
      streetName: 'Test St',
      city: 'Testville',
      stateCode: 'FL',
      countryCode: 'US',
      zip: '12345',
    } as AddressPartialDto;

    const address = await addressService.getBy(addressData);
    expect(address).toBeDefined();
  });

  test('address get or create should not create duplicate address', async () => {
    const {
      domain: {
        address: { addressService },
      },
    } = testService;

    const addressData = {
      streetNumber: '124',
      streetName: 'Test St',
      city: 'Testville',
      stateCode: 'AZ',
      countryCode: 'US',
      zip: '12345',
      latitude: 25.7617,
      longitude: -80.1918,
    } as AddressPartialDto;

    const expectedAddressData = {
      ...addressData,
      streetName: 'Test',
      streetSuffix: 'St',
    };

    const firstAddress = await addressService.getOrCreate(addressData);
    expect(firstAddress).toBeDefined();
    expect(firstAddress.streetName).toBe(expectedAddressData.streetName);

    const secondAddress = await addressService.getOrCreate(addressData);
    expect(secondAddress).toBeDefined();
    expect(secondAddress.id).toBe(firstAddress.id);
  });
});
