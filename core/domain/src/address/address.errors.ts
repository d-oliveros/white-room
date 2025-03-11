import { NotFoundError, BadRequestError, InternalError } from '@namespace/shared';

export class AddressAlreadyExistsError extends BadRequestError {
  constructor(message = 'Address already exists') {
    super(message);
    this.name = 'AddressAlreadyExists';
  }
}

export class AddressNotFoundError extends NotFoundError {
  constructor(message = 'Address not found') {
    super(message);
    this.name = 'AddressNotFound';
  }
}

export class AddressDisplayRequiredError extends BadRequestError {
  constructor(message = 'Display field is required') {
    super(message);
    this.name = 'AddressDisplayRequired';
  }
}

export class AddressPopulateLocationFieldsError extends InternalError {
  constructor(message = 'Failed to populate location fields') {
    super(message);
    this.name = 'AddressPopulateLocationFields';
  }
}
