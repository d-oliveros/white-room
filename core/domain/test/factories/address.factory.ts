import type { DataSource } from 'typeorm';
import type { FactorizedAttrs } from '@jorgebodega/typeorm-factory';
import { Factory } from '@jorgebodega/typeorm-factory';
import { faker } from '@faker-js/faker';
import { AddressType, State, normalizeAddress } from '@namespace/address-helpers';
import { generateSnowflakeId } from '@domain/lib/snowflake';
import { Address } from '@domain/address/address.model';

function randomUnitNumber() {
  const parts = [
    faker.number.int({ min: 1, max: 4 }).toString(),
    Math.random() > 0.2 ? '' : faker.string.alpha({ length: 1, casing: 'upper' }),
  ];

  return parts.join('');
}

export class AddressFactory extends Factory<Address> {
  protected entity = Address;
  protected dataSource: DataSource;

  constructor(dataSource: DataSource) {
    super();
    this.dataSource = dataSource;
  }

  protected attrs(): FactorizedAttrs<Address> {
    const addressFields = normalizeAddress({
      streetName: faker.location.street(),
      streetNumber: faker.location.buildingNumber(),
      streetPrefix: faker.helpers.maybe(() => faker.helpers.arrayElement(['N', 'S', 'E', 'W']), {
        probability: 0.2,
      }),
      streetSuffix: faker.helpers.arrayElement(['St', 'Ave', 'Rd']),
      unitNumber: faker.helpers.maybe(randomUnitNumber, {
        probability: 0.3,
      }),
      city: faker.location.city(),
      stateCode: faker.helpers.arrayElement(Object.values(State)),
      countryCode: 'US' as const,
      county: faker.location.county(),
      zip: faker.location.zipCode('#####'),
    }) as Address;

    return {
      ...addressFields,
      id: generateSnowflakeId(),
      createdAt: faker.date.past(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      type: AddressType.Address,
    };
  }
}
