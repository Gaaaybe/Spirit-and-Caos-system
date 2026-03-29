import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

export type EquipSlot = 'suit' | 'accessory' | 'hand' | 'quick-access';

interface UnequipItemUseCaseRequest {
  characterId: string;
  userId: string;
  itemId: string;
  slot: EquipSlot;
  quantity?: number;
}

type UnequipItemUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class UnequipItemUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    itemId,
    slot,
    quantity = 1,
  }: UnequipItemUseCaseRequest): Promise<UnequipItemUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.unequipItem(itemId, slot, quantity);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
