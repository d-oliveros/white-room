import type { UserRepository } from './user.repository';
import type { UserCreateDto, UserUpdateDto } from './user.schemas';

import { UserAlreadyExistsError, UserNotFoundError } from './user.errors';
import { User } from './user.model';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async findByPhoneOrEmail({
    phone,
    email,
  }: {
    phone?: string;
    email?: string;
  }): Promise<User | null> {
    return await this.userRepository.findByPhoneOrEmail({ phone, email });
  }

  async getList(): Promise<User[]> {
    return this.userRepository.getList();
  }

  async findUserHashedPassword(userId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['password'],
    });
    return user?.password ?? null;
  }

  /**
   * Creates a new user.
   *
   * @param {UserCreateDto} userData - An object containing the user data.
   * @throws NamespaceError if a user with the same phone or email already exists.
   * @returns {Promise<User>} The newly created user.
   */
  async createUser(userData: UserCreateDto): Promise<User> {
    const existingUser = await this.findByPhoneOrEmail({
      phone: userData.phone,
      email: userData.email,
    });

    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const user = User.create(userData);

    const savedUser = await this.userRepository.save(user);
    savedUser.password = undefined;
    return savedUser;
  }

  /**
   * Updates a user's information.
   *
   * @param {string} userId - The ID of the user to update.
   * @param {UserUpdate} userData - The new user data to apply.
   * @throws {NamespaceError} If the user is not found.
   * @returns {Promise<UserSummary>} The updated user summary.
   */
  async updateUser(userId: string, userData: UserUpdateDto): Promise<User> {
    const user = await this.getById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    user.update(userData);

    await this.userRepository.save(user);

    return user;
  }

  /**
   * Deletes a user from the system.
   *
   * @param {number} userId - The ID of the user to delete.
   * @throws {NamespaceError} If the user is not found.
   * @returns {Promise<void>}
   */
  async deleteUser(userId: string): Promise<void> {
    const user = await this.getById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.userRepository.remove(user);
  }
}
