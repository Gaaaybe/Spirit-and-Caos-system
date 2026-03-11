import type { PaginationParams } from '@/core/repositories/paginationParams';
import type { ItemType } from '../../enterprise/entities/item';
import type { Item, ItemBaseProps } from '../../enterprise/entities/item';

export abstract class ItemsRepository {
  abstract findById(id: string): Promise<Item<ItemBaseProps> | null>;
  abstract findMany(params: PaginationParams): Promise<Item<ItemBaseProps>[]>;
  abstract findByUserId(
    userId: string,
    params: PaginationParams,
    tipo?: ItemType,
  ): Promise<Item<ItemBaseProps>[]>;
  abstract findByType(type: ItemType, params: PaginationParams): Promise<Item<ItemBaseProps>[]>;
  abstract findPublic(params: PaginationParams, tipo?: ItemType): Promise<Item<ItemBaseProps>[]>;
  abstract create(item: Item<ItemBaseProps>): Promise<void>;
  abstract update(item: Item<ItemBaseProps>): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
