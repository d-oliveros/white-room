import { InternalError } from '@namespace/shared';

export class LambdaCallError extends InternalError {
  constructor(message = 'Lambda call failed') {
    super(message);
    this.name = 'LambdaCallError';
  }
}
