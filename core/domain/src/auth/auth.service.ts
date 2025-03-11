import type { User } from '../user/user.model';
import type { UserService } from '../user/user.service';
import type {
  UserSessionDto,
  UserSummaryDto,
  UserCreateDto,
  UserLoginDto,
} from '../user/user.schemas';

import { createLogger } from '@namespace/logger';
import { compareHashedString, hashString } from '@namespace/crypto';
import { decodeToken, generateToken } from '@domain/lib/jwt';

import { UserSessionSchema, UserSummarySchema } from '../user/user.schemas';
import { InvalidCredentialsError, NoUserLoginFoundError } from './auth.errors';

const logger = createLogger('auth.service');

export class AuthService {
  constructor(private userService: UserService) {}

  /**
   * Authenticates a user and generates a token.
   *
   * @param {UserLoginDto} loginData - An object containing the login credentials.
   * @throws NamespaceError if the credentials are invalid.
   * @returns {Promise<{ user: User, token: string }>} The authenticated user and token.
   */
  async login(loginData: UserLoginDto): Promise<{ user: User; token: string }> {
    const user = await this.userService.findByPhoneOrEmail({
      phone: loginData.phone,
      email: loginData.email,
    });

    if (!user) {
      throw new NoUserLoginFoundError();
    }

    const userPassword = await this.userService.findUserHashedPassword(user.id);

    if (!userPassword) {
      throw new InvalidCredentialsError('User has no password');
    }

    const passwordIsValid = await compareHashedString(loginData.password, userPassword);

    if (!passwordIsValid) {
      throw new InvalidCredentialsError();
    }

    const token = await generateToken(UserSessionSchema.parse(user));

    return { user, token };
  }

  async signup(signupData: UserCreateDto): Promise<{ user: User; token: string }> {
    const hashedPassword = await hashString(signupData.password);
    const user = await this.userService.createUser({
      ...signupData,
      password: hashedPassword,
    });
    const token = await generateToken(UserSessionSchema.parse(user));
    return { user, token };
  }

  /**
   * Decodes the token and loads the user.
   *
   * @param {string} token - The JWT token to decode.
   * @throws {NamespaceError} If the token is invalid or the user is not found.
   * @returns {Promise<UserSummaryDto>} The user associated with the token.
   */
  async getUserByToken(token: string): Promise<UserSummaryDto> {
    try {
      const userSession = await decodeToken<UserSessionDto>(token);
      const user = await this.userService.getById(userSession.id);

      if (!user) {
        throw new NoUserLoginFoundError();
      }

      return UserSummarySchema.parse(user);
    } catch (error) {
      logger.error(error);
      throw new InvalidCredentialsError('Invalid token');
    }
  }
}
