import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { ItemsRepository } from '../repositories/items-repository';

interface DeleteItemUseCaseRequest {
  itemId: string;
  userId: string;
}

type DeleteItemUseCaseResponse = Either<ResourceNotFoundError | NotAllowedError, null>;

@Injectable()
export class DeleteItemUseCase {
  constructor(private itemsRepository: ItemsRepository) {}

  async execute({ itemId, userId }: DeleteItemUseCaseRequest): Promise<DeleteItemUseCaseResponse> {
    const item = await this.itemsRepository.findById(itemId);

    if (!item) {
      return left(new ResourceNotFoundError());
    }

    if (!item.canBeEditedBy(userId)) {
      return left(new NotAllowedError());
    }

    await this.itemsRepository.delete(itemId);

    return right(null);
  }
}
