import type { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

/**
 * AuthModule manages the dependencies and lifecycle of authentication-related domain services.
 * It provides access to authentication services while encapsulating their implementation details.
 */
export class AuthModule {
  public readonly authService: AuthService;

  constructor(userService: UserService) {
    this.authService = new AuthService(userService);
  }
}
