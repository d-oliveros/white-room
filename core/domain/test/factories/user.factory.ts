import type { DataSource } from 'typeorm';
import type { FactorizedAttrs } from '@jorgebodega/typeorm-factory';
import { faker } from '@faker-js/faker';
import { Factory } from '@jorgebodega/typeorm-factory';
import { hashString } from '@namespace/crypto';
import { generateSnowflakeId } from '@domain/lib/snowflake';
import { User } from '@domain/user/user.model';
import { UserRole, UserStatus } from '@domain/user/user.constants';

function generatePhoneNumber() {
  // Generate first 3 digits and last 4 digits
  const firstPart = faker.number.int({ min: 100, max: 999 });
  const lastPart = faker.number.int({ min: 1000, max: 9999 });

  // Combine the parts with 555 in the middle
  const phoneNumber = `${firstPart}555${lastPart}`;

  return phoneNumber;
}

export class UserFactory extends Factory<User> {
  protected entity = User;
  protected dataSource: DataSource;

  constructor(dataSource: DataSource) {
    super();
    this.dataSource = dataSource;
  }

  protected attrs(): FactorizedAttrs<User> {
    return {
      id: generateSnowflakeId(),
      createdAt: faker.date.past(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phone: generatePhoneNumber(),
      email: faker.internet.email().toLowerCase(),
      password: async () => hashString('1234'),
      roles: [UserRole.User],
      shouldRefreshRoles: false,
      status: UserStatus.Active,
      profilePictureUrl: faker.image.avatar(),
    };
  }
}
