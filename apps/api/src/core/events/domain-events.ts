import type { AggregateRoot } from '../entities/aggregate-root';
import type { DomainEvent } from './domain-event';
import type { UniqueEntityId } from '../entities/unique-entity-ts';

type DomainEventCallback = (event: DomainEvent) => void;

export class DomainEvents {
  private static handlersMap: Record<string, DomainEventCallback[]> = {};
  private static markedAggregates: AggregateRoot<unknown>[] = [];

  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  private static dispatchAggregateEvents(aggregate: AggregateRoot<unknown>): void {
    aggregate.domainEvents.forEach((event: DomainEvent) => this.dispatch(event));
  }

  private static removeAggregateFromMarkedDispatchList(aggregate: AggregateRoot<unknown>): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));

    if (index !== -1) {
      this.markedAggregates.splice(index, 1);
    }
  }

  private static findMarkedAggregateByID(
    id: UniqueEntityId,
  ): AggregateRoot<unknown> | undefined {
    return this.markedAggregates.find((aggregate) => aggregate.id.equals(id));
  }

  public static dispatchEventsForAggregate(id: UniqueEntityId): void {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  public static register(callback: DomainEventCallback, eventClassName: string): void {
    if (!Object.prototype.hasOwnProperty.call(this.handlersMap, eventClassName)) {
      this.handlersMap[eventClassName] = [];
    }

    this.handlersMap[eventClassName].push(callback);
  }

  public static clearHandlers(): void {
    this.handlersMap = {};
  }

  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }

  private static dispatch(event: DomainEvent): void {
    const eventClassName: string = event.constructor.name;

    if (Object.prototype.hasOwnProperty.call(this.handlersMap, eventClassName)) {
      const handlers = this.handlersMap[eventClassName];

      for (const handler of handlers) {
        handler(event);
      }
    }
  }
}
