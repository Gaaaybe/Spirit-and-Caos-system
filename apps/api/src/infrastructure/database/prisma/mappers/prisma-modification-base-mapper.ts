import {
  type Prisma,
  type ModificationBase as PrismaModificationBase,
  ModificationType as PrismaModificationType,
} from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import {
  ModificationBase,
  type ModificationConfiguration,
  ModificationParameterType,
  ModificationType,
} from '@/domain/power-manager/enterprise/entities/modification-base';

export function toDomain(raw: PrismaModificationBase): ModificationBase {
  return ModificationBase.create(
    {
      id: raw.id,
      nome: raw.nome,
      tipo:
        raw.tipo === PrismaModificationType.EXTRA ? ModificationType.EXTRA : ModificationType.FALHA,
      custoFixo: raw.custoFixo,
      custoPorGrau: raw.custoPorGrau,
      descricao: raw.descricao,
      categoria: raw.categoria,
      observacoes: raw.observacoes ?? undefined,
      detalhesGrau: raw.detalhesGrau ?? undefined,
      requerParametros: raw.requerParametros,
      tipoParametro: (raw.tipoParametro as ModificationParameterType) ?? undefined,
      opcoes: raw.opcoes.length > 0 ? raw.opcoes : undefined,
      grauMinimo: raw.grauMinimo ?? undefined,
      grauMaximo: raw.grauMaximo ?? undefined,
      placeholder: raw.placeholder ?? undefined,
      configuracoes: (raw.configuracoes as unknown as ModificationConfiguration) ?? undefined,
      custom: raw.custom,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(mod: ModificationBase): Prisma.ModificationBaseUncheckedCreateInput {
  return {
    id: mod.modificationId,
    nome: mod.nome,
    tipo:
      mod.tipo === ModificationType.EXTRA
        ? PrismaModificationType.EXTRA
        : PrismaModificationType.FALHA,
    custoFixo: mod.custoFixo,
    custoPorGrau: mod.custoPorGrau,
    descricao: mod.descricao,
    categoria: mod.categoria,
    observacoes: mod.observacoes,
    detalhesGrau: mod.detalhesGrau,
    requerParametros: mod.requerParametros,
    tipoParametro: mod.tipoParametro,
    opcoes: mod.opcoes ?? [],
    grauMinimo: mod.grauMinimo,
    grauMaximo: mod.grauMaximo,
    placeholder: mod.placeholder,
    configuracoes: (mod.configuracoes ?? undefined) as Prisma.InputJsonObject | undefined,
    custom: mod.custom,
  };
}
