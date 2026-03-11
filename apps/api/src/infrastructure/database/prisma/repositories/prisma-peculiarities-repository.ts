import { Injectable } from '@nestjs/common';
import type { PaginationParams } from '@/core/repositories/paginationParams';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';
import type { Peculiarity } from '@/domain/power-manager/enterprise/entities/peculiarity';
import * as PeculiarityMapper from '../mappers/prisma-peculiarity-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPeculiaritiesRepository extends PeculiaritiesRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<Peculiarity | null> {
    const raw = await this.prisma.peculiarity.findUnique({ where: { id } });
    return raw ? PeculiarityMapper.toDomain(raw) : null;
  }

  async findByUserId(userId: string, { page }: PaginationParams): Promise<Peculiarity[]> {
    const raws = await this.prisma.peculiarity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PeculiarityMapper.toDomain);
  }

  async findPublic({ page }: PaginationParams): Promise<Peculiarity[]> {
    const raws = await this.prisma.peculiarity.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      skip: (page - 1) * 20,
    });
    return raws.map(PeculiarityMapper.toDomain);
  }

  async create(peculiarity: Peculiarity): Promise<void> {
    await this.prisma.peculiarity.create({ data: PeculiarityMapper.toPrisma(peculiarity) });
  }

  async update(peculiarity: Peculiarity): Promise<void> {
    await this.prisma.peculiarity.update({
      where: { id: peculiarity.id.toString() },
      data: PeculiarityMapper.toPrisma(peculiarity),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.peculiarity.delete({ where: { id } });
  }
}
