import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@/core/events/domain-events';
import { CharacterPowerDiscardedEvent } from '@/domain/character-manager/enterprise/events/character-power-discarded-event';
import { PowersRepository } from '../repositories/powers-repository';

@Injectable()
export class OnCharacterPowerDiscarded implements OnModuleInit {
  constructor(private powersRepository: PowersRepository) {}

  onModuleInit(): void {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handleCharacterPowerDiscarded.bind(this),
      CharacterPowerDiscardedEvent.name,
    );
  }

  private async handleCharacterPowerDiscarded(event: CharacterPowerDiscardedEvent) {
    const { discardedPowerId } = event;
    const power = await this.powersRepository.findById(discardedPowerId);

    if (power && !power.isPublic) {
      await this.powersRepository.delete(discardedPowerId);
    }
  }
}
