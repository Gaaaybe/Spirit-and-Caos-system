import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@/core/events/domain-events';
import { CharacterPowerArrayDiscardedEvent } from '@/domain/character-manager/enterprise/events/character-power-array-discarded-event';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';

@Injectable()
export class OnCharacterPowerArrayDiscarded implements OnModuleInit {
  constructor(private powerArraysRepository: PowerArraysRepository) {}

  onModuleInit(): void {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handleCharacterPowerArrayDiscarded.bind(this),
      CharacterPowerArrayDiscardedEvent.name,
    );
  }

  private async handleCharacterPowerArrayDiscarded(event: CharacterPowerArrayDiscardedEvent) {
    const { discardedPowerArrayId } = event;
    const powerArray = await this.powerArraysRepository.findById(discardedPowerArrayId);

    if (powerArray && !powerArray.isPublic) {
      await this.powerArraysRepository.delete(discardedPowerArrayId);
    }
  }
}
