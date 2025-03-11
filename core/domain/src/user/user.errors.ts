import { NotFoundError, BadRequestError } from '@namespace/shared';

export class UserAlreadyExistsError extends BadRequestError {
  constructor(message = 'User already exists') {
    super(message);
    this.name = 'UserAlreadyExists';
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFound';
  }
}
