import type { Observable } from 'rxjs';
import type { IEventBus, DomainEvent } from '@domain/lib/EventBus';
import { of } from 'rxjs';

export class MockEventBus implements IEventBus {
  private publishedEvents: DomainEvent[] = [];
  private subscriptions: Map<string, DomainEvent[]> = new Map();

  publish(event: DomainEvent | DomainEvent[]): void {
    const events = Array.isArray(event) ? event : [event];
    this.publishedEvents.push(...events);

    // Store events by type for subscription testing
    events.forEach((e) => {
      const existing = this.subscriptions.get(e.type) || [];
      this.subscriptions.set(e.type, [...existing, e]);
    });
  }

  on<T extends DomainEvent>(): Observable<T> {
    // Return an empty observable that can be spied on
    return of() as Observable<T>;
  }

  // Helper methods for testing
  getPublishedEvents(): DomainEvent[] {
    return [...this.publishedEvents];
  }

  getEventsByType(eventType: string): DomainEvent[] {
    return this.subscriptions.get(eventType) || [];
  }

  clearPublishedEvents(): void {
    this.publishedEvents = [];
    this.subscriptions.clear();
  }
}
