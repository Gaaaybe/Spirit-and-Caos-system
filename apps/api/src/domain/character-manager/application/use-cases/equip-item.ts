import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { ItemsLookupPort } from '../repositories/items-lookup-port';
import { Character } from '../../enterprise/entities/character';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

export type EquipSlot = 'suit' | 'accessory' | 'hand' | 'quick-access';

interface EquipItemUseCaseRequest {
  characterId: string;
  userId: string;
  itemId: string;
  slot: EquipSlot;
  quantity?: number;
}

type EquipItemUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
  {
    character: Character;
  }
>;

@Injectable()
export class EquipItemUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private itemsLookupPort: ItemsLookupPort,
  ) {}

  async execute({
    characterId,
    userId,
    itemId,
    slot,
    quantity = 1,
  }: EquipItemUseCaseRequest): Promise<EquipItemUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const item = await this.itemsLookupPort.findById(itemId);

    if (!item) {
      return left(new ResourceNotFoundError());
    }

    const maxStack = item.maxStack ?? 1;

    const inInventory = character.inventory.bag.find(i => i.itemId === itemId);
    
    if (!inInventory || inInventory.quantity < quantity) {
        return left(new DomainValidationError('Quantidade de item insuficiente no inventário.', 'itemId'));
    }

    character.equipItem(itemId, slot, quantity, maxStack);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
