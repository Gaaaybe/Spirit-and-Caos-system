import type { PaginationParams } from '@/core/repositories/paginationParams';
import { ItemsRepository } from '@/domain/item-manager/application/repositories/items-repository';
import type { Item, ItemBaseProps, ItemType } from '@/domain/item-manager/enterprise/entities/item';

export class InMemoryItemsRepository extends ItemsRepository {
  public items: Item<ItemBaseProps>[] = [];

  async findById(id: string): Promise<Item<ItemBaseProps> | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findMany(params: PaginationParams): Promise<Item<ItemBaseProps>[]> {
    const start = (params.page - 1) * 20;
    return this.items.slice(start, start + 20);
  }

  async findByUserId(
    userId: string,
    params: PaginationParams,
    tipo?: ItemType,
  ): Promise<Item<ItemBaseProps>[]> {
    const filtered = this.items.filter(
      (item) => item.userId === userId && (tipo === undefined || item.tipo === tipo),
    );
    const start = (params.page - 1) * 20;
    return filtered.slice(start, start + 20);
  }

  async findByCharacterId(characterId: string): Promise<Item<ItemBaseProps>[]> {
    return this.items.filter((item) => item.characterId === characterId);
  }

  async findByType(type: ItemType, params: PaginationParams): Promise<Item<ItemBaseProps>[]> {
    const filtered = this.items.filter((item) => item.tipo === type);
    const start = (params.page - 1) * 20;
    return filtered.slice(start, start + 20);
  }

  async findPublic(params: PaginationParams, tipo?: ItemType): Promise<Item<ItemBaseProps>[]> {
    const filtered = this.items.filter(
      (item) => (item.isOfficial() || item.isPublic) && (tipo === undefined || item.tipo === tipo),
    );
    const start = (params.page - 1) * 20;
    return filtered.slice(start, start + 20);
  }

  async create(item: Item<ItemBaseProps>): Promise<void> {
    this.items.push(item);
  }

  async update(item: Item<ItemBaseProps>): Promise<void> {
    const index = this.items.findIndex((i) => i.id.equals(item.id));
    if (index !== -1) this.items[index] = item;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
