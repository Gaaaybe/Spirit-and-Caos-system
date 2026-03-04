import { type Prisma, type EffectBase as PrismaEffectBase } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import {
  EffectBase,
  type EffectConfiguration,
  EffectInputType,
} from '@/domain/power-manager/enterprise/entities/effect-base';
import type {
  ActionType,
  DurationType,
  RangeType,
} from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';
import { PowerParameters } from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';

export function toDomain(raw: PrismaEffectBase): EffectBase {
  return EffectBase.create(
    {
      id: raw.id,
      nome: raw.nome,
      custoBase: raw.custoBase,
      descricao: raw.descricao,
      categorias: raw.categorias,
      exemplos: raw.exemplos ?? undefined,
      parametrosPadrao: PowerParameters.create({
        acao: raw.parametrosPadraoAcao as ActionType,
        alcance: raw.parametrosPadraoAlcance as RangeType,
        duracao: raw.parametrosPadraoDuracao as DurationType,
      }),
      requerInput: raw.requerInput,
      tipoInput: (raw.tipoInput as EffectInputType) ?? undefined,
      labelInput: raw.labelInput ?? undefined,
      opcoesInput: raw.opcoesInput.length > 0 ? raw.opcoesInput : undefined,
      placeholderInput: raw.placeholderInput ?? undefined,
      configuracoes: (raw.configuracoes as unknown as EffectConfiguration) ?? undefined,
      custom: raw.custom,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(effect: EffectBase): Prisma.EffectBaseUncheckedCreateInput {
  return {
    id: effect.effectId,
    nome: effect.nome,
    custoBase: effect.custoBase,
    descricao: effect.descricao,
    categorias: effect.categorias,
    exemplos: effect.exemplos,
    parametrosPadraoAcao: effect.parametrosPadrao.acao,
    parametrosPadraoAlcance: effect.parametrosPadrao.alcance,
    parametrosPadraoDuracao: effect.parametrosPadrao.duracao,
    requerInput: effect.requerInput,
    tipoInput: effect.tipoInput,
    labelInput: effect.labelInput,
    opcoesInput: effect.opcoesInput ?? [],
    placeholderInput: effect.placeholderInput,
    configuracoes: (effect.configuracoes ?? undefined) as Prisma.InputJsonObject | undefined,
    custom: effect.custom,
  };
}
