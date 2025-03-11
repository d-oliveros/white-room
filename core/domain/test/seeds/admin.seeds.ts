import type { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { UserRole } from '@domain/user/user.constants';
import { UserFactory } from '../factories/user.factory';

const adminUsers = [
  {
    firstName: 'David',
    lastName: 'Oliveros',
    email: 'dato.oliveros@gmail.com',
    phone: '8185555235',
  },
];

export class AdminSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const userFactory = new UserFactory(dataSource);
    const userRepository = dataSource.getRepository('User');

    for (const user of adminUsers) {
      const existingAdmin = await userRepository.findOneBy([
        { email: user.email },
        { phone: user.phone },
      ]);

      if (!existingAdmin) {
        await userFactory.create({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: [UserRole.Admin, UserRole.User],
          phone: user.phone,
        });
      }
    }
  }
}
