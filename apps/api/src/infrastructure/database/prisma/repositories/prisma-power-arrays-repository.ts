import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '@/core/repositories/paginationParams';
import { PowerArraysRepository } from '@/domain/power-manager/application/repositories/power-arrays-repository';
import type { PowerArray } from '@/domain/power-manager/enterprise/entities/power-array';
import * as PrismaPowerArrayMapper from '../mappers/prisma-power-array-mapper';
import { PrismaService } from '../prisma.service';

const INCLUDE = {
  powerArrayPowers: {
    include: {
      power: { include: { appliedEffects: { include: { appliedModifications: true } } } },
    },
    orderBy: { posicao: 'asc' as const },
  },
} as const;

@Injectable()
export class PrismaPowerArraysRepository extends PowerArraysRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<PowerArray | null> {
    const raw = await this.prisma.powerArray.findUnique({ where: { id }, include: INCLUDE });
    return raw ? PrismaPowerArrayMapper.toDomain(raw) : null;
  }

  async findByPowerId(powerId: string): Promise<PowerArray[]> {
    const raws = await this.prisma.powerArray.findMany({
      where: {
        powerArrayPowers: {
          some: { powerId },
        },
      },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return raws.map(PrismaPowerArrayMapper.toDomain);
  }

  async findMany({ page }: PaginationParams): Promise<PowerArray[]> {
    const raws = await this.prisma.powerArray.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerArrayMapper.toDomain);
  }

  async findByUserId(userId: string, { page }: PaginationParams): Promise<PowerArray[]> {
    const raws = await this.prisma.powerArray.findMany({
      where: { userId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerArrayMapper.toDomain);
  }

  async findByCharacterId(characterId: string): Promise<PowerArray[]> {
    const characterPowerArrays = await this.prisma.characterPowerArray.findMany({
      where: { characterId },
      include: {
        powerArray: {
          include: INCLUDE,
        },
      },
    });

    return characterPowerArrays.map((cpa) => PrismaPowerArrayMapper.toDomain(cpa.powerArray));
  }

  async findByDomain(domainName: string, { page }: PaginationParams): Promise<PowerArray[]> {
    const raws = await this.prisma.powerArray.findMany({
      where: { domainName: domainName as never },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerArrayMapper.toDomain);
  }

  async findPublic({ page }: PaginationParams): Promise<PowerArray[]> {
    const raws = await this.prisma.powerArray.findMany({
      where: { isPublic: true },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerArrayMapper.toDomain);
  }

  async create(powerArray: PowerArray): Promise<void> {
    await this.prisma.powerArray.create({ data: PrismaPowerArrayMapper.toPrisma(powerArray) });
  }

  async update(powerArray: PowerArray): Promise<void> {
    const { id, powerArrayPowers, ...fields } = PrismaPowerArrayMapper.toPrisma(powerArray);
    await this.prisma.$transaction([
      this.prisma.powerArrayPower.deleteMany({ where: { powerArrayId: id as string } }),
      this.prisma.powerArray.update({
        where: { id: id as string },
        data: { ...fields, powerArrayPowers },
      }),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.powerArray.delete({ where: { id } });
  }
}
