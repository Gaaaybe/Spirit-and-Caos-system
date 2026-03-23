import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainEvent } from '@/core/events/domain-event';
import { Character } from '../entities/character';

export class CharacterPowerDiscardedEvent implements DomainEvent {
  public ocurredAt: Date;
  public character: Character;
  public discardedPowerId: string;

  constructor(character: Character, discardedPowerId: string) {
    this.character = character;
    this.discardedPowerId = discardedPowerId;
    this.ocurredAt = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.character.id;
  }
}
