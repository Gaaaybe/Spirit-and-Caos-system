import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { ItemsRepository } from '../repositories/items-repository';
import { Item, ItemBaseProps } from '../../enterprise/entities/item';

interface FetchCharacterItemsUseCaseRequest {
  characterId: string;
}

type FetchCharacterItemsUseCaseResponse = Either<
  null,
  {
    items: Item<ItemBaseProps>[];
  }
>;

@Injectable()
export class FetchCharacterItemsUseCase {
  constructor(private itemsRepository: ItemsRepository) {}

  async execute({
    characterId,
  }: FetchCharacterItemsUseCaseRequest): Promise<FetchCharacterItemsUseCaseResponse> {
    const items = await this.itemsRepository.findByCharacterId(characterId);

    return right({
      items,
    });
  }
}
