import type {
  Prisma,
  AppliedEffect as PrismaAppliedEffect,
  AppliedModification as PrismaAppliedModification,
} from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { AppliedEffect } from '@/domain/power-manager/enterprise/entities/applied-effect';

import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';
import * as AppliedModificationMapper from './prisma-applied-modification-mapper';

export type PrismaAppliedEffectWithMods = PrismaAppliedEffect & {
  appliedModifications: PrismaAppliedModification[];
};

export function toDomain(raw: PrismaAppliedEffectWithMods): AppliedEffect {
  const localMods = raw.appliedModifications
    .filter((m) => (m.scope as string) !== 'GLOBAL')
    .sort((a, b) => a.posicao - b.posicao)
    .map(AppliedModificationMapper.toDomain);

  return AppliedEffect.create(
    {
      effectBaseId: raw.effectBaseId,
      grau: raw.grau,
      configuracaoId: raw.configuracaoId ?? undefined,
      inputValue: raw.inputValue ?? undefined,
      modifications: localMods,
      custo: PowerCost.create({
        pda: raw.custoPda,
        pe: raw.custoPe,
        espacos: raw.custoEspacos,
      }),
      nota: raw.nota ?? undefined,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(
  effect: AppliedEffect,
  powerId: string,
  posicao: number,
): Prisma.AppliedEffectUncheckedCreateInput {
  return {
    id: effect.id.toString(),
    powerId,
    effectBaseId: effect.effectBaseId,
    grau: effect.grau,
    configuracaoId: effect.configuracaoId,
    inputValue: effect.inputValue !== undefined ? String(effect.inputValue) : undefined,
    custoPda: effect.custo.pda,
    custoPe: effect.custo.pe,
    custoEspacos: effect.custo.espacos,
    nota: effect.nota,
    posicao,
  };
}

export function extractGlobalMods(raw: PrismaAppliedEffectWithMods) {
  return raw.appliedModifications
    .filter((m) => (m.scope as string) === 'GLOBAL')
    .sort((a, b) => a.posicao - b.posicao)
    .map(AppliedModificationMapper.toDomain);
}
