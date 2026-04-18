import { Injectable } from '@nestjs/common';
import { CharactersRepository } from '@/domain/character-manager/application/repositories/characters-repository';
import { Character } from '@/domain/character-manager/enterprise/entities/character';
import * as PrismaCharacterMapper from '../mappers/prisma-character-mapper';
import { PrismaService } from '../prisma.service';

import { DomainEvents } from '@/core/events/domain-events';

const INCLUDE = {
  powers: true,
  powerArrays: true,
  benefits: true,
  domains: true,
} as const;

@Injectable()
export class PrismaCharactersRepository extends CharactersRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(character: Character): Promise<void> {
    await this.prisma.character.create({ data: PrismaCharacterMapper.toPrisma(character) });
    DomainEvents.dispatchEventsForAggregate(character.id);
  }

  async save(character: Character): Promise<void> {
    const { id, powers, powerArrays, benefits, domains, ...fields } =
      PrismaCharacterMapper.toPrisma(character);

    await this.prisma.$transaction([
      this.prisma.characterPower.deleteMany({ where: { characterId: id } }),
      this.prisma.characterPowerArray.deleteMany({ where: { characterId: id } }),
      this.prisma.characterBenefit.deleteMany({ where: { characterId: id } }),
      this.prisma.characterDomain.deleteMany({ where: { characterId: id } }),
      this.prisma.character.update({
        where: { id },
        data: {
          ...fields,
          powers,
          powerArrays,
          benefits,
          domains,
        },
      }),
    ]);

    DomainEvents.dispatchEventsForAggregate(character.id);
  }

  async findById(id: string): Promise<Character | null> {
    const raw = await this.prisma.character.findUnique({ where: { id }, include: INCLUDE });
    return raw ? PrismaCharacterMapper.toDomain(raw) : null;
  }

  async findByUserId(userId: string): Promise<Character[]> {
    const raws = await this.prisma.character.findMany({
      where: { userId },
      include: INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    return raws.map(PrismaCharacterMapper.toDomain);
  }

  async findMany(): Promise<Character[]> {
    const raws = await this.prisma.character.findMany({
      include: INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    return raws.map(PrismaCharacterMapper.toDomain);
  }

  async delete(character: Character): Promise<void> {
    await this.prisma.character.delete({ where: { id: character.id.toString() } });
  }
}
