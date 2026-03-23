import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface RemoveFromInventoryUseCaseRequest {
  characterId: string;
  userId: string;
  itemId: string;
  quantity?: number;
}

type RemoveFromInventoryUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class RemoveFromInventoryUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    itemId,
    quantity = 1,
  }: RemoveFromInventoryUseCaseRequest): Promise<RemoveFromInventoryUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.removeFromInventory(itemId, quantity);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
