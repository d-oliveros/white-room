/**
 * Generated by orval v7.4.1 🍺
 * Do not edit manually.
 * Namespace API
 * API interface. Manually create requests to the API using this UI.
 * OpenAPI spec version: 1.0.0
 */
import type { GetAddressesAddressId200AddressStreetName } from './getAddressesAddressId200AddressStreetName';
import type { GetAddressesAddressId200AddressStreetNumber } from './getAddressesAddressId200AddressStreetNumber';
import type { GetAddressesAddressId200AddressStreetPrefix } from './getAddressesAddressId200AddressStreetPrefix';
import type { GetAddressesAddressId200AddressStreetSuffix } from './getAddressesAddressId200AddressStreetSuffix';
import type { GetAddressesAddressId200AddressUnitNumber } from './getAddressesAddressId200AddressUnitNumber';
import type { GetAddressesAddressId200AddressStateCode } from './getAddressesAddressId200AddressStateCode';
import type { GetAddressesAddressId200AddressCounty } from './getAddressesAddressId200AddressCounty';
import type { GetAddressesAddressId200AddressType } from './getAddressesAddressId200AddressType';
import type { GetAddressesAddressId200AddressStreetDisplay } from './getAddressesAddressId200AddressStreetDisplay';
import type { GetAddressesAddressId200AddressCreatedAt } from './getAddressesAddressId200AddressCreatedAt';

export type GetAddressesAddressId200Address = {
  streetName: GetAddressesAddressId200AddressStreetName;
  streetNumber: GetAddressesAddressId200AddressStreetNumber;
  streetPrefix: GetAddressesAddressId200AddressStreetPrefix;
  streetSuffix: GetAddressesAddressId200AddressStreetSuffix;
  unitNumber?: GetAddressesAddressId200AddressUnitNumber;
  /** @minLength 2 */
  city: string;
  stateCode: GetAddressesAddressId200AddressStateCode;
  county: GetAddressesAddressId200AddressCounty;
  /**
   * @minLength 2
   * @maxLength 2
   */
  countryCode?: string;
  /**
   * @minLength 5
   * @maxLength 5
   * @pattern ^\d{5}$
   */
  zip: string;
  /**
   * @minimum -90
   * @maximum 90
   */
  latitude: number;
  /**
   * @minimum -180
   * @maximum 180
   */
  longitude: number;
  type: GetAddressesAddressId200AddressType;
  /** @minLength 1 */
  display: string;
  streetDisplay: GetAddressesAddressId200AddressStreetDisplay;
  /** @minLength 1 */
  id: string;
  createdAt: GetAddressesAddressId200AddressCreatedAt;
};
