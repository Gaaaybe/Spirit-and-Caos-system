import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import type { Item, ItemBaseProps } from '../../enterprise/entities/item';
import { ItemsRepository } from '../repositories/items-repository';

interface GetItemByIdUseCaseRequest {
  itemId: string;
}

interface GetItemByIdUseCaseResponseData {
  item: Item<ItemBaseProps>;
}

type GetItemByIdUseCaseResponse = Either<ResourceNotFoundError, GetItemByIdUseCaseResponseData>;

@Injectable()
export class GetItemByIdUseCase {
  constructor(private itemsRepository: ItemsRepository) {}

  async execute({ itemId }: GetItemByIdUseCaseRequest): Promise<GetItemByIdUseCaseResponse> {
    const item = await this.itemsRepository.findById(itemId);

    if (!item) {
      return left(new ResourceNotFoundError());
    }

    return right({ item });
  }
}
