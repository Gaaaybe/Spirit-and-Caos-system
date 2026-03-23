import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DomainEvents } from '@/core/events/domain-events';
import { CharacterItemDiscardedEvent } from '@/domain/character-manager/enterprise/events/character-item-discarded-event';
import { ItemsRepository } from '../repositories/items-repository';

@Injectable()
export class OnCharacterItemDiscarded implements OnModuleInit {
  constructor(private itemsRepository: ItemsRepository) {}

  onModuleInit(): void {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.handleCharacterItemDiscarded.bind(this),
      CharacterItemDiscardedEvent.name,
    );
  }

  private async handleCharacterItemDiscarded(event: CharacterItemDiscardedEvent) {
    const { discardedItemId } = event;
    const item = await this.itemsRepository.findById(discardedItemId);

    if (item && !item.isPublic) {
      await this.itemsRepository.delete(discardedItemId);
    }
  }
}
