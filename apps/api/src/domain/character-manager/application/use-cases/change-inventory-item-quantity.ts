import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { NotAllowedError } from './errors/not-allowed-error';

interface ChangeInventoryItemQuantityUseCaseRequest {
  characterId: string;
  userId: string;
  itemId: string;
  quantity: number;
}

type ChangeInventoryItemQuantityUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class ChangeInventoryItemQuantityUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    itemId,
    quantity,
  }: ChangeInventoryItemQuantityUseCaseRequest): Promise<ChangeInventoryItemQuantityUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (character.userId.toString() !== userId) {
      return left(new NotAllowedError());
    }

    const itemExistsInBag = character.inventory.bag.some((i) => i.itemId === itemId);
    if (!itemExistsInBag) {
      return left(new ResourceNotFoundError());
    }

    character.setItemQuantityInInventory(itemId, quantity);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
