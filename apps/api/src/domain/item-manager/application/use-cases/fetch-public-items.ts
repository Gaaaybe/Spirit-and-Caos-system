import { Injectable } from '@nestjs/common';
import { type Either, right } from '@/core/either';
import type { Item, ItemBaseProps, ItemType } from '../../enterprise/entities/item';
import { ItemsRepository } from '../repositories/items-repository';

interface FetchPublicItemsUseCaseRequest {
  page: number;
  tipo?: ItemType;
}

interface FetchPublicItemsUseCaseResponseData {
  items: Item<ItemBaseProps>[];
}

type FetchPublicItemsUseCaseResponse = Either<null, FetchPublicItemsUseCaseResponseData>;

@Injectable()
export class FetchPublicItemsUseCase {
  constructor(private itemsRepository: ItemsRepository) {}

  async execute({
    page,
    tipo,
  }: FetchPublicItemsUseCaseRequest): Promise<FetchPublicItemsUseCaseResponse> {
    const items = await this.itemsRepository.findPublic({ page }, tipo);

    return right({ items });
  }
}
