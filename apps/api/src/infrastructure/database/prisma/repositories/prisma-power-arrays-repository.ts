import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
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
      where: { userId, characterId: null },
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
    await this.prisma.$transaction(async (tx) => {
      await tx.powerArrayPower.deleteMany({ where: { powerArrayId: id as string } });

      await tx.powerArray.update({
        where: { id: id as string },
        data: { ...fields, powerArrayPowers },
      });

      await tx.characterPowerArray.updateMany({
        where: { powerArrayId: id as string },
        data: {
          finalPdaCost: fields.custoTotalPda as number,
          slotCost: fields.custoTotalEspacos as number,
        },
      });

      const impactedCharacters = await tx.characterPowerArray.findMany({
        where: { powerArrayId: id as string },
        select: { characterId: true },
        distinct: ['characterId'],
      });

      for (const { characterId } of impactedCharacters) {
        const [powersSum, arraysSum, benefitsSum, character] = await Promise.all([
          tx.characterPower.aggregate({
            where: { characterId },
            _sum: { finalPdaCost: true },
          }),
          tx.characterPowerArray.aggregate({
            where: { characterId },
            _sum: { finalPdaCost: true },
          }),
          tx.characterBenefit.aggregate({
            where: { characterId },
            _sum: { pdaCost: true },
          }),
          tx.character.findUnique({
            where: { id: characterId },
            select: { pdaState: true },
          }),
        ]);

        if (!character) continue;

        const currentPdaState = (character.pdaState ?? {}) as Record<string, unknown>;
        const recalculatedSpent =
          (powersSum._sum.finalPdaCost ?? 0) +
          (arraysSum._sum.finalPdaCost ?? 0) +
          (benefitsSum._sum.pdaCost ?? 0);

        await tx.character.update({
          where: { id: characterId },
          data: {
            pdaState: {
              ...(currentPdaState as Prisma.InputJsonObject),
              spentPda: recalculatedSpent,
            } as Prisma.InputJsonValue,
          },
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.powerArray.delete({ where: { id } });
  }
}
