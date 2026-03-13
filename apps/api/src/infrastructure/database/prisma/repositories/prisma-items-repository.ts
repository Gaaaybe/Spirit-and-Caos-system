import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '@/core/repositories/paginationParams';
import { ItemsRepository } from '@/domain/item-manager/application/repositories/items-repository';
import type { Item, ItemBaseProps } from '@/domain/item-manager/enterprise/entities/item';
import { ItemType } from '@/domain/item-manager/enterprise/entities/item';
import * as PrismaItemMapper from '../mappers/prisma-item-mapper';
import { PrismaService } from '../prisma.service';

const INCLUDE = {
  itemDamages: true,
  itemPowers: true,
  itemPowerArrays: true,
} as const;

const ITEM_TYPE_TO_PRISMA: Record<ItemType, string> = {
  [ItemType.WEAPON]: 'WEAPON',
  [ItemType.DEFENSIVE_EQUIPMENT]: 'DEFENSIVE_EQUIPMENT',
  [ItemType.CONSUMABLE]: 'CONSUMABLE',
  [ItemType.ARTIFACT]: 'ARTIFACT',
  [ItemType.ACCESSORY]: 'ACCESSORY',
};

@Injectable()
export class PrismaItemsRepository extends ItemsRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Item<ItemBaseProps> | null> {
    const raw = await this.prisma.item.findUnique({ where: { id }, include: INCLUDE });
    return raw ? PrismaItemMapper.toDomain(raw) : null;
  }

  async findMany({ page }: PaginationParams): Promise<Item<ItemBaseProps>[]> {
    const raws = await this.prisma.item.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaItemMapper.toDomain);
  }

  async findByUserId(
    userId: string,
    { page }: PaginationParams,
    tipo?: ItemType,
  ): Promise<Item<ItemBaseProps>[]> {
    const raws = await this.prisma.item.findMany({
      where: {
        userId,
        ...(tipo ? { tipo: ITEM_TYPE_TO_PRISMA[tipo] as never } : {}),
      },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaItemMapper.toDomain);
  }

  async findByType(type: ItemType, { page }: PaginationParams): Promise<Item<ItemBaseProps>[]> {
    const raws = await this.prisma.item.findMany({
      where: { tipo: ITEM_TYPE_TO_PRISMA[type] as never },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaItemMapper.toDomain);
  }

  async findPublic(
    { page }: PaginationParams,
    tipo?: ItemType,
  ): Promise<Item<ItemBaseProps>[]> {
    const raws = await this.prisma.item.findMany({
      where: {
        OR: [{ userId: null }, { isPublic: true }],
        ...(tipo ? { tipo: ITEM_TYPE_TO_PRISMA[tipo] as never } : {}),
      },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaItemMapper.toDomain);
  }

  async create(item: Item<ItemBaseProps>): Promise<void> {
    await this.prisma.item.create({ data: PrismaItemMapper.toPrisma(item) });
  }

  async update(item: Item<ItemBaseProps>): Promise<void> {
    const { id, itemDamages, itemPowers, itemPowerArrays, ...fields } =
      PrismaItemMapper.toPrisma(item);
    await this.prisma.$transaction([
      this.prisma.itemDamage.deleteMany({ where: { itemId: id as string } }),
      this.prisma.itemPower.deleteMany({ where: { itemId: id as string } }),
      this.prisma.itemPowerArray.deleteMany({ where: { itemId: id as string } }),
      this.prisma.item.update({
        where: { id: id as string },
        data: { ...fields, itemDamages, itemPowers, itemPowerArrays },
      }),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.item.delete({ where: { id } });
  }
}
