import { DomainEvent } from '@/core/events/domain-event';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Character } from '../entities/character';

export class CharacterLeveledUpEvent implements DomainEvent {
  public ocurredAt: Date;
  public character: Character;
  public newLevel: number;

  constructor(character: Character, newLevel: number) {
    this.character = character;
    this.newLevel = newLevel;
    this.ocurredAt = new Date();
  }

  getAggregateId(): UniqueEntityId {
    return this.character.id;
  }
}
