import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainEvent } from '@/core/events/domain-event';
import { Character } from '../entities/character';

export class CharacterPowerArrayDiscardedEvent implements DomainEvent {
  public ocurredAt: Date;
  public character: Character;
  public discardedPowerArrayId: string;

  constructor(character: Character, discardedPowerArrayId: string) {
    this.character = character;
    this.discardedPowerArrayId = discardedPowerArrayId;
    this.ocurredAt = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.character.id;
  }
}
