import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainEvent } from '@/core/events/domain-event';
import { Character } from '../entities/character';

export class CharacterItemDiscardedEvent implements DomainEvent {
  public ocurredAt: Date;
  public character: Character;
  public discardedItemId: string;

  constructor(character: Character, discardedItemId: string) {
    this.character = character;
    this.discardedItemId = discardedItemId;
    this.ocurredAt = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.character.id;
  }
}
