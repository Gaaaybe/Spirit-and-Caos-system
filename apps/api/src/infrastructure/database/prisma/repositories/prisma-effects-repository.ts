import { Injectable } from '@nestjs/common';
import { EffectsRepository } from '@/domain/power-manager/application/repositories/effects-repository';
import type { EffectBase } from '@/domain/power-manager/enterprise/entities/effect-base';
import * as EffectBaseMapper from '../mappers/prisma-effect-base-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaEffectsRepository extends EffectsRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<EffectBase | null> {
    const raw = await this.prisma.effectBase.findUnique({ where: { id } });
    return raw ? EffectBaseMapper.toDomain(raw) : null;
  }

  async findAll(): Promise<EffectBase[]> {
    const raws = await this.prisma.effectBase.findMany({ orderBy: { nome: 'asc' } });
    return raws.map(EffectBaseMapper.toDomain);
  }

  async findByCategory(category: string): Promise<EffectBase[]> {
    const raws = await this.prisma.effectBase.findMany({
      where: { categorias: { has: category } },
      orderBy: { nome: 'asc' },
    });
    return raws.map(EffectBaseMapper.toDomain);
  }

  async findCustomEffects(): Promise<EffectBase[]> {
    const raws = await this.prisma.effectBase.findMany({
      where: { custom: true },
      orderBy: { nome: 'asc' },
    });
    return raws.map(EffectBaseMapper.toDomain);
  }

  async create(effect: EffectBase): Promise<void> {
    await this.prisma.effectBase.create({ data: EffectBaseMapper.toPrisma(effect) });
  }

  async update(effect: EffectBase): Promise<void> {
    await this.prisma.effectBase.update({
      where: { id: effect.effectId },
      data: EffectBaseMapper.toPrisma(effect),
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.effectBase.delete({ where: { id } });
  }
}
