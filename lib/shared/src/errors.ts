interface NamespaceErrorArgs {
  name: string;
  message: string;
  statusCode?: number;
  details?: object;
  cause?: Error;
}

export class NamespaceError extends Error {
  public readonly statusCode?: number;
  public readonly details?: object;
  public readonly cause?: Error;

  constructor({ name, message, statusCode, details, cause }: NamespaceErrorArgs) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.details = details;
    this.cause = cause;
  }
}

export class BadRequestError extends NamespaceError {
  constructor(message: string) {
    super({
      name: 'BadRequest',
      message,
      statusCode: 400,
    });
  }
}

export class UnauthorizedError extends NamespaceError {
  constructor(message: string) {
    super({
      name: 'Unauthorized',
      message,
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends NamespaceError {
  constructor(message: string) {
    super({
      name: 'Forbidden',
      message,
      statusCode: 403,
    });
  }
}

export class NotFoundError extends NamespaceError {
  constructor(message: string) {
    super({
      name: 'NotFound',
      message,
      statusCode: 404,
    });
  }
}

export class InternalError extends NamespaceError {
  constructor(message?: string) {
    super({
      name: 'InternalServer',
      message: message || 'Internal server error',
      statusCode: 500,
    });
  }
}

export class ServiceUnavailableError extends NamespaceError {
  constructor(message?: string) {
    super({
      name: 'ServiceUnavailable',
      message: message || 'Service unavailable',
      statusCode: 503,
    });
  }
}
