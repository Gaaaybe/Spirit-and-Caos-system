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
    const { character, discardedItemId } = event;

    const isEquipped = 
      character.equipment.suitId === discardedItemId ||
      character.equipment.accessoryId === discardedItemId ||
      character.equipment.hands.some(h => h.itemId === discardedItemId) ||
      character.equipment.quickAccess.some(q => q.itemId === discardedItemId);

    if (isEquipped) {
      return;
    }

    const item = await this.itemsRepository.findById(discardedItemId);

    if (item && !item.isPublic) {
      await this.itemsRepository.delete(discardedItemId);
    }
  }
}
