import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import type { Item, ItemBaseProps } from '../../enterprise/entities/item';
import { ItemsRepository } from '../repositories/items-repository';

interface CopyPublicItemUseCaseRequest {
  itemId: string;
  userId: string;
}

interface CopyPublicItemUseCaseResponseData {
  item: Item<ItemBaseProps>;
}

type CopyPublicItemUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  CopyPublicItemUseCaseResponseData
>;

@Injectable()
export class CopyPublicItemUseCase {
  constructor(private itemsRepository: ItemsRepository) {}

  async execute({
    itemId,
    userId,
  }: CopyPublicItemUseCaseRequest): Promise<CopyPublicItemUseCaseResponse> {
    const original = await this.itemsRepository.findById(itemId);

    if (!original) {
      return left(new ResourceNotFoundError());
    }

    if (!original.canBeAccessedBy(userId)) {
      return left(new NotAllowedError());
    }

    const copy = original.copyForUser(userId);

    await this.itemsRepository.create(copy);

    return right({ item: copy });
  }
}
