import {
  requestGoogleEndpoint,
  requestAutocomplete,
  findAddressLocation,
  isGoogleEnabled,
} from './google.client';

// Mock logger implementation
jest.mock('@namespace/logger', () => ({
  createLogger: jest.fn(() => ({
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

const runTestsIfGoogleEnabled = isGoogleEnabled ? describe : describe.skip;

runTestsIfGoogleEnabled('Google Client', () => {
  jest.setTimeout(10000);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestGoogleEndpoint', () => {
    it('should make API request', async () => {
      const result = await requestGoogleEndpoint({
        method: 'GET',
        path: 'api/place/autocomplete/json',
        params: { input: 'New York', components: 'country:us' },
      });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('predictions');
    });
  });

  describe('requestAutocomplete', () => {
    it('should return predictions for valid input', async () => {
      const result = await requestAutocomplete({
        input: 'New York',
      });

      expect(result).toBeTruthy();
      expect(Array.isArray(result?.predictions)).toBe(true);
      expect(result?.predictions.length).toBeGreaterThan(0);
      expect(result?.predictions[0]).toHaveProperty('place_id');
      expect(result?.predictions[0]).toHaveProperty('description');
      expect(result?.predictions[0]).not.toHaveProperty('googlePlace');
    });

    it('should populate places when requested', async () => {
      const result = await requestAutocomplete({
        input: 'New York',
        populatePlaces: true,
      });

      expect(result).toBeTruthy();
      expect(Array.isArray(result?.predictions)).toBe(true);
      expect(result?.predictions.length).toBeGreaterThan(0);
      expect(result?.predictions[0]).toHaveProperty('googlePlace');
      expect(result?.predictions[0].googlePlace).toHaveProperty('geometry');
      expect(result?.predictions[0].googlePlace).toHaveProperty('address_components');

      expect(result?.predictions[0].googlePlace?.geometry.location).toBeTruthy();
      expect(typeof result?.predictions[0].googlePlace?.geometry.location.lat).toBe('number');
      expect(typeof result?.predictions[0].googlePlace?.geometry.location.lng).toBe('number');
      expect(Number.isFinite(result?.predictions[0].googlePlace?.geometry.location.lat)).toBe(true);
      expect(Number.isFinite(result?.predictions[0].googlePlace?.geometry.location.lng)).toBe(true);
    });
  });

  describe('findAddressLocation', () => {
    it('should return coordinates for valid address', async () => {
      const result = await findAddressLocation({
        streetNumber: '350',
        streetName: '5th Ave',
        city: 'New York',
        zip: '10118',
        stateCode: 'NY',
      });

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(typeof result?.latitude).toBe('number');
      expect(typeof result?.longitude).toBe('number');
    });

    it('should return null for invalid address', async () => {
      const result = await findAddressLocation({
        streetNumber: '',
        streetName: '',
        city: '',
        zip: '',
        stateCode: '',
      });

      expect(result).toBeNull();
    });
  });
});
