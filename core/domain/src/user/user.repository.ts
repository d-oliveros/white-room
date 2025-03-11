import type { DataSource } from 'typeorm';
import { Repository } from 'typeorm';
import { BadRequestError } from '@namespace/shared';
import { User } from './user.model';

export type UserRepositoryGetByPhoneOrEmailArgs = {
  phone?: string;
  email?: string;
};

export class UserRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async findByPhoneOrEmail({
    phone,
    email,
  }: UserRepositoryGetByPhoneOrEmailArgs): Promise<User | null> {
    if (!phone && !email) {
      throw new BadRequestError('Either phone or email must be provided');
    }

    const whereConditions = [];

    if (phone) {
      whereConditions.push({ phone });
    }

    if (email) {
      whereConditions.push({ email });
    }

    return this.findOne({
      where: whereConditions,
    });
  }

  async getList(): Promise<User[]> {
    return this.find();
  }
}
