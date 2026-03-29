import { DomainEvent } from '@/core/events/domain-event';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Character } from '../entities/character';

export class CharacterCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public character: Character;

  constructor(character: Character) {
    this.character = character;
    this.ocurredAt = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.character.id;
  }
}
