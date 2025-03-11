import type { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

/**
 * UserModule manages the dependencies and lifecycle of user-related domain services.
 * It provides access to user and authentication services while encapsulating their implementation details.
 */
export class UserModule {
  public readonly userService: UserService;
  private readonly userRepository: UserRepository;

  constructor(dataSource: DataSource) {
    this.userRepository = new UserRepository(dataSource);
    this.userService = new UserService(this.userRepository);
  }
}
