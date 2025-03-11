import { NotFoundError, BadRequestError } from '@namespace/shared';

export class NoUserLoginFoundError extends NotFoundError {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'NoUserLoginFound';
  }
}

export class InvalidCredentialsError extends BadRequestError {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentials';
  }
}
