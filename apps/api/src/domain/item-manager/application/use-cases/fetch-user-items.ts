import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import type { Item, ItemBaseProps } from '../../enterprise/entities/item';
import type { ItemType } from '../../enterprise/entities/item';
import { ItemsRepository } from '../repositories/items-repository';

interface FetchUserItemsUseCaseRequest {
  userId: string;
  page: number;
  tipo?: ItemType;
}

interface FetchUserItemsUseCaseResponseData {
  items: Item<ItemBaseProps>[];
}

type FetchUserItemsUseCaseResponse = Either<null, FetchUserItemsUseCaseResponseData>;

@Injectable()
export class FetchUserItemsUseCase {
  constructor(private itemsRepository: ItemsRepository) {}

  async execute({
    userId,
    page,
    tipo,
  }: FetchUserItemsUseCaseRequest): Promise<FetchUserItemsUseCaseResponse> {
    const items = await this.itemsRepository.findByUserId(userId, { page }, tipo);

    return right({ items });
  }
}
