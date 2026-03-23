import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { ItemsLookupPort } from '../repositories/items-lookup-port';
import { Character } from '../../enterprise/entities/character';

interface AddItemToInventoryUseCaseRequest {
  characterId: string;
  userId: string;
  itemId: string;
  quantity?: number;
}

type AddItemToInventoryUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class AddItemToInventoryUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private itemsLookupPort: ItemsLookupPort,
  ) {}

  async execute({
    characterId,
    userId,
    itemId,
    quantity = 1,
  }: AddItemToInventoryUseCaseRequest): Promise<AddItemToInventoryUseCaseResponse> {
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

    const newInstanceId = await this.itemsLookupPort.createCharacterInstance(
      itemId,
      characterId,
      userId,
    );

    if (!newInstanceId) {
      return left(new ResourceNotFoundError());
    }

    character.addToInventory(newInstanceId, quantity);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
