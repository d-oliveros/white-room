import { DomainEvent } from '@domain/lib/EventBus';

interface UserCreatedEventData {
  userId: string;
  firstName: string;
  email: string;
}

export class UserCreatedEvent extends DomainEvent<UserCreatedEventData> {
  readonly type = 'UserCreated';

  constructor(public readonly payload: UserCreatedEventData) {
    super(payload);
  }
}
