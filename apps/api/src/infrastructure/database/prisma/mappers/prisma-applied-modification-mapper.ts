import {
  Prisma,
  type AppliedModification as PrismaAppliedModification,
  ModificationScope as PrismaModificationScope,
} from '@prisma/client';
import {
  AppliedModification,
  ModificationScope,
} from '@/domain/power-manager/enterprise/entities/value-objects/applied-modification';

export function toDomain(raw: PrismaAppliedModification): AppliedModification {
  return AppliedModification.create({
    modificationBaseId: raw.modificationBaseId,
    scope:
      raw.scope === PrismaModificationScope.GLOBAL
        ? ModificationScope.GLOBAL
        : ModificationScope.LOCAL,
    grau: raw.grau,
    parametros: (raw.parametros as Record<string, unknown>) ?? undefined,
    nota: raw.nota ?? undefined,
  });
}

export function toPrisma(
  mod: AppliedModification,
  appliedEffectId: string,
  posicao: number,
): Prisma.AppliedModificationUncheckedCreateInput {
  return {
    appliedEffectId,
    modificationBaseId: mod.modificationBaseId,
    scope:
      mod.scope === ModificationScope.GLOBAL
        ? PrismaModificationScope.GLOBAL
        : PrismaModificationScope.LOCAL,
    grau: mod.grau,
    parametros: (mod.parametros ?? undefined) as Prisma.InputJsonObject | undefined,
    nota: mod.nota,
    posicao,
  };
}
