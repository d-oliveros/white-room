import type { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { AddressFactory } from '../factories/address.factory';

export class AddressSeeder extends Seeder {
  async run(dataSource: DataSource) {
    await new AddressFactory(dataSource).createMany(10);
  }
}
