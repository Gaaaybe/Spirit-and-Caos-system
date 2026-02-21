import type { UniqueEntityId } from '../entities/unique-entity-ts';

export interface DomainEvent {
  ocurredAt: Date;
  getAggregateId(): UniqueEntityId;
}
