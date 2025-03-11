import type { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { UserFactory } from '../factories/user.factory';

export class UserSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const userFactory = new UserFactory(dataSource);
    await userFactory.createMany(10);
  }
}
