import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { PaginationParams } from '@/core/repositories/paginationParams';
import { PowersRepository } from '@/domain/power-manager/application/repositories/powers-repository';
import type { Power } from '@/domain/power-manager/enterprise/entities/power';
import * as PrismaPowerMapper from '../mappers/prisma-power-mapper';
import { PrismaService } from '../prisma.service';

const INCLUDE = {
  appliedEffects: { include: { appliedModifications: true } },
} as const;

@Injectable()
export class PrismaPowersRepository extends PowersRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Power | null> {
    const raw = await this.prisma.power.findUnique({ where: { id }, include: INCLUDE });
    return raw ? PrismaPowerMapper.toDomain(raw) : null;
  }

  async findMany({ page }: PaginationParams): Promise<Power[]> {
    const raws = await this.prisma.power.findMany({
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerMapper.toDomain);
  }

  async findByUserId(userId: string, { page }: PaginationParams): Promise<Power[]> {
    const raws = await this.prisma.power.findMany({
      where: { userId, characterId: null },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerMapper.toDomain);
  }

  async findByCharacterId(characterId: string): Promise<Power[]> {
    const characterPowers = await this.prisma.characterPower.findMany({
      where: { characterId },
      include: {
        power: {
          include: INCLUDE,
        },
      },
    });

    return characterPowers.map((cp) => PrismaPowerMapper.toDomain(cp.power));
  }

  async findByDomain(domainName: string, { page }: PaginationParams): Promise<Power[]> {
    const raws = await this.prisma.power.findMany({
      where: { domainName: domainName as never },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerMapper.toDomain);
  }

  async findUserCreatedPowers({ page }: PaginationParams): Promise<Power[]> {
    const raws = await this.prisma.power.findMany({
      where: { userId: { not: null } },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerMapper.toDomain);
  }

  async findPublic({ page }: PaginationParams): Promise<Power[]> {
    const raws = await this.prisma.power.findMany({
      where: { isPublic: true },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerMapper.toDomain);
  }

  async create(power: Power): Promise<void> {
    await this.prisma.power.create({ data: PrismaPowerMapper.toPrisma(power) });
  }

  async update(power: Power): Promise<void> {
    const { id, appliedEffects, ...fields } = PrismaPowerMapper.toPrisma(power);
    await this.prisma.$transaction(async (tx) => {
      await tx.appliedEffect.deleteMany({ where: { powerId: id as string } });

      await tx.power.update({
        where: { id: id as string },
        data: { ...fields, appliedEffects },
      });

      await tx.characterPower.updateMany({
        where: { powerId: id as string },
        data: {
          finalPdaCost: fields.custoTotalPda as number,
          slotCost: fields.custoTotalEspacos as number,
        },
      });

      const impactedArrayLinks = await tx.powerArrayPower.findMany({
        where: { powerId: id as string },
        select: { powerArrayId: true },
        distinct: ['powerArrayId'],
      });

      for (const { powerArrayId } of impactedArrayLinks) {
        const arrayPowers = await tx.powerArrayPower.findMany({
          where: { powerArrayId },
          select: {
            power: {
              select: {
                custoTotalPda: true,
                custoTotalPe: true,
                custoTotalEspacos: true,
              },
            },
          },
        });

        const highestPda = arrayPowers.length
          ? Math.max(...arrayPowers.map((entry) => entry.power.custoTotalPda))
          : 0;
        const additionalPowersCost = Math.max(0, arrayPowers.length - 1);
        const totalPe = arrayPowers.reduce((sum, entry) => sum + entry.power.custoTotalPe, 0);
        const totalEspacos = arrayPowers.reduce(
          (sum, entry) => sum + entry.power.custoTotalEspacos,
          0,
        );

        await tx.powerArray.update({
          where: { id: powerArrayId },
          data: {
            custoTotalPda: highestPda + additionalPowersCost,
            custoTotalPe: totalPe,
            custoTotalEspacos: totalEspacos,
          },
        });

        await tx.characterPowerArray.updateMany({
          where: { powerArrayId },
          data: {
            finalPdaCost: highestPda + additionalPowersCost,
            slotCost: totalEspacos,
          },
        });
      }

      const impactedCharactersFromPowers = await tx.characterPower.findMany({
        where: { powerId: id as string },
        select: { characterId: true },
        distinct: ['characterId'],
      });

      const impactedCharactersFromArrays = await tx.characterPowerArray.findMany({
        where: {
          powerArrayId: {
            in: impactedArrayLinks.map((link) => link.powerArrayId),
          },
        },
        select: { characterId: true },
        distinct: ['characterId'],
      });

      const impactedCharacterIds = Array.from(
        new Set([
          ...impactedCharactersFromPowers.map(({ characterId }) => characterId),
          ...impactedCharactersFromArrays.map(({ characterId }) => characterId),
        ]),
      );

      for (const characterId of impactedCharacterIds) {
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
    await this.prisma.power.delete({ where: { id } });
  }
}
