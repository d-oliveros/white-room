import type { Observable } from 'rxjs';
import { Subject, filter } from 'rxjs';
import { createLogger } from '@namespace/logger';

const logger = createLogger('EventBus');

export abstract class DomainEvent<T = unknown> {
  abstract readonly type: string;

  readonly metadata: {
    timestamp: Date;
  };

  constructor(public readonly payload: T) {
    this.metadata = {
      timestamp: new Date(),
    };
  }
}

export interface IEventBus {
  publish(event: DomainEvent | DomainEvent[]): void;
  on<T extends DomainEvent>(eventType: string): Observable<T>;
}

export class EventBus implements IEventBus {
  private eventSubject = new Subject<DomainEvent>();

  publish(event: DomainEvent | DomainEvent[]): void {
    for (const _event of Array.isArray(event) ? event : [event]) {
      logger.debug(`Publishing event: ${_event.type}`);
      this.eventSubject.next(_event);
    }
  }

  on<T extends DomainEvent>(eventType: string): Observable<T> {
    return this.eventSubject.pipe(filter((event): event is T => event.type === eventType));
  }
}

export abstract class EventHandler {
  constructor(protected readonly eventBus: IEventBus) {}

  protected createSubscription<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<void>,
  ) {
    return this.eventBus.on<T>(eventType).subscribe({
      next: async (event) => {
        try {
          await handler(event);
        } catch (error) {
          logger.error(
            error,
            `Error handling event ${eventType}: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
          );
        }
      },
      error: (error) => {
        logger.error(
          error,
          `Error in event stream ${eventType}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
      },
    });
  }
}
