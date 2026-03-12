import type { Prisma, Peculiarity as PrismaPeculiarity } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Peculiarity } from '@/domain/power-manager/enterprise/entities/peculiarity';

export function toDomain(raw: PrismaPeculiarity): Peculiarity {
  return Peculiarity.create(
    {
      userId: raw.userId,
      nome: raw.nome,
      descricao: raw.descricao,
      espiritual: raw.espiritual,
      isPublic: raw.isPublic,
      icone: raw.icone ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(peculiarity: Peculiarity): Prisma.PeculiarityUncheckedCreateInput {
  return {
    id: peculiarity.id.toString(),
    userId: peculiarity.userId,
    nome: peculiarity.nome,
    descricao: peculiarity.descricao,
    espiritual: peculiarity.espiritual,
    isPublic: peculiarity.isPublic,
    icone: peculiarity.icone,
    createdAt: peculiarity.createdAt,
    updatedAt: peculiarity.updatedAt,
  };
}
