import { Injectable } from '@nestjs/common';
import { ModificationType } from '@prisma/client';
import { ModificationsRepository } from '@/domain/power-manager/application/repositories/modifications-repository';
import type { ModificationBase } from '@/domain/power-manager/enterprise/entities/modification-base';
import * as ModificationBaseMapper from '../mappers/prisma-modification-base-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaModificationsRepository extends ModificationsRepository {
  constructor(private prisma: PrismaService) {
    super();
  }
  async findById(id: string): Promise<ModificationBase | null> {
    const raw = await this.prisma.modificationBase.findUnique({ where: { id } });
    return raw ? ModificationBaseMapper.toDomain(raw) : null;
  }
  async findAll(): Promise<ModificationBase[]> {
    const raws = await this.prisma.modificationBase.findMany();
    return raws.map(ModificationBaseMapper.toDomain);
  }
  async findByType(type: 'extra' | 'falha'): Promise<ModificationBase[]> {
    const raws = await this.prisma.modificationBase.findMany({
      where: { tipo: type === 'extra' ? ModificationType.EXTRA : ModificationType.FALHA },
    });
    return raws.map(ModificationBaseMapper.toDomain);
  }
  async findByCategory(category: string): Promise<ModificationBase[]> {
    const raws = await this.prisma.modificationBase.findMany({
      where: { categoria: category },
    });
    return raws.map(ModificationBaseMapper.toDomain);
  }
  findCustomModifications(): Promise<ModificationBase[]> {
    throw new Error('Method not implemented.');
  }
  create(_modification: ModificationBase): Promise<void> {
    throw new Error('Method not implemented.');
  }
  update(_modification: ModificationBase): Promise<void> {
    throw new Error('Method not implemented.');
  }
  delete(_id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
