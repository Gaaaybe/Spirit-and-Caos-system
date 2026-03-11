import { Injectable } from '@nestjs/common';
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
      where: { userId },
      include: INCLUDE,
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PrismaPowerMapper.toDomain);
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
    await this.prisma.$transaction([
      this.prisma.appliedEffect.deleteMany({ where: { powerId: id as string } }),
      this.prisma.power.update({
        where: { id: id as string },
        data: { ...fields, appliedEffects },
      }),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.power.delete({ where: { id } });
  }
}
