import type { Prisma, DomainName as PrismaDomainName } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Power } from '@/domain/power-manager/enterprise/entities/power';
import {
  AlternativeCost,
  AlternativeCostType,
} from '@/domain/power-manager/enterprise/entities/value-objects/alternative-cost';
import { ModificationScope } from '@/domain/power-manager/enterprise/entities/value-objects/applied-modification';
import {
  Domain,
  DomainName,
} from '@/domain/power-manager/enterprise/entities/value-objects/domain';
import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';
import type {
  ActionType,
  DurationType,
  RangeType,
} from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';
import { PowerParameters } from '@/domain/power-manager/enterprise/entities/value-objects/power-parameters';
import { PowerEffectList } from '@/domain/power-manager/enterprise/entities/watched-lists/power-effect-list';
import { PowerGlobalModificationList } from '@/domain/power-manager/enterprise/entities/watched-lists/power-global-modification-list';
import * as AppliedEffectMapper from './prisma-applied-effect-mapper';
import * as AppliedModificationMapper from './prisma-applied-modification-mapper';

export type PrismaPowerFull = Prisma.PowerGetPayload<{
  include: { 
    appliedEffects: { include: { appliedModifications: true } },
    user: { select: { id: true, name: true } }
  };
}>;

const DOMAIN_NAME_TO_DOMAIN: Record<PrismaDomainName, DomainName> = {
  NATURAL: DomainName.NATURAL,
  SAGRADO: DomainName.SAGRADO,
  SACRILEGIO: DomainName.SACRILEGIO,
  PSIQUICO: DomainName.PSIQUICO,
  CIENTIFICO: DomainName.CIENTIFICO,
  PECULIAR: DomainName.PECULIAR,
  ARMA_BRANCA: DomainName.ARMA_BRANCA,
  ARMA_FOGO: DomainName.ARMA_FOGO,
  ARMA_TENSAO: DomainName.ARMA_TENSAO,
  ARMA_EXPLOSIVA: DomainName.ARMA_EXPLOSIVA,
  ARMA_TECNOLOGICA: DomainName.ARMA_TECNOLOGICA,
  DESARMADO: DomainName.DESARMADO,
};

const DOMAIN_NAME_TO_PRISMA: Record<DomainName, PrismaDomainName> = {
  [DomainName.NATURAL]: 'NATURAL',
  [DomainName.SAGRADO]: 'SAGRADO',
  [DomainName.SACRILEGIO]: 'SACRILEGIO',
  [DomainName.PSIQUICO]: 'PSIQUICO',
  [DomainName.CIENTIFICO]: 'CIENTIFICO',
  [DomainName.PECULIAR]: 'PECULIAR',
  [DomainName.ARMA_BRANCA]: 'ARMA_BRANCA',
  [DomainName.ARMA_FOGO]: 'ARMA_FOGO',
  [DomainName.ARMA_TENSAO]: 'ARMA_TENSAO',
  [DomainName.ARMA_EXPLOSIVA]: 'ARMA_EXPLOSIVA',
  [DomainName.ARMA_TECNOLOGICA]: 'ARMA_TECNOLOGICA',
  [DomainName.DESARMADO]: 'DESARMADO',
};

export function toDomain(raw: PrismaPowerFull): Power {
  const sortedEffects = [...raw.appliedEffects].sort((a, b) => a.posicao - b.posicao);

  const effects = new PowerEffectList();
  effects.update(sortedEffects.map(AppliedEffectMapper.toDomain));

  const globalMods = sortedEffects.flatMap(AppliedEffectMapper.extractGlobalMods);
  const globalModList = new PowerGlobalModificationList();
  globalModList.update(globalMods);

  const dominio = Domain.create({
    name: DOMAIN_NAME_TO_DOMAIN[raw.domainName],
    areaConhecimento: raw.domainAreaConhecimento ?? undefined,
    peculiarId: raw.domainPeculiarId ?? undefined,
  });

  const parametros = PowerParameters.create({
    acao: raw.parametrosAcao as ActionType,
    alcance: raw.parametrosAlcance as RangeType,
    duracao: raw.parametrosDuracao as DurationType,
  });

  const custoTotal = PowerCost.create({
    pda: raw.custoTotalPda,
    pe: raw.custoTotalPe,
    espacos: raw.custoTotalEspacos,
  });

  const custoAlternativo =
    raw.custoAlternativoTipo && raw.custoAlternativoQuantidade
      ? AlternativeCost.create({
          tipo: raw.custoAlternativoTipo as AlternativeCostType,
          quantidade: raw.custoAlternativoQuantidade,
          descricao: raw.custoAlternativoDescricao ?? undefined,
          atributo: raw.custoAlternativoAtributo ?? undefined,
          itemId: raw.custoAlternativoItemId ?? undefined,
        })
      : undefined;

  return Power.create(
    {
      userId: raw.userId ?? undefined,
      characterId: raw.characterId ?? undefined,
      nome: raw.nome,
      descricao: raw.descricao,
      dominio,
      parametros,
      effects,
      globalModifications: globalModList,
      custoTotal,
      custoAlternativo,
      isPublic: raw.isPublic,
      icone: raw.icone ?? undefined,
      notas: raw.notas ?? undefined,
      userName: raw.user?.name,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(power: Power): Prisma.PowerUncheckedCreateInput {
  const id = power.id.toString();
  const effectItems = power.effects.getItems();
  const globalModItems = power.globalModifications.getItems();
  const alt = power.custoAlternativo;

  const appliedEffects: Omit<Prisma.AppliedEffectUncheckedCreateInput, 'powerId'>[] =
    effectItems.map((effect, i) => {
      const {
        powerId: _powerId,
        id: _effectId,
        ...base
      } = AppliedEffectMapper.toPrisma(effect, id, i);

      const localMods = effect.modifications.map((mod, j) => {
        const { appliedEffectId: _aeid, ...modBase } = AppliedModificationMapper.toPrisma(
          mod,
          effect.id.toString(),
          j,
        );
        return modBase;
      });

      const globalMods =
        i === 0
          ? globalModItems.map((mod, j) => {
              const { appliedEffectId: _aeid, ...modBase } = AppliedModificationMapper.toPrisma(
                mod.withScope(ModificationScope.GLOBAL),
                effect.id.toString(),
                localMods.length + j,
              );
              return modBase;
            })
          : [];

      return {
        ...base,
        appliedModifications: { create: [...localMods, ...globalMods] },
      };
    });

  return {
    id,
    userId: power.userId,
    characterId: power.characterId,
    nome: power.nome,
    descricao: power.descricao,
    isPublic: power.isPublic,
    icone: power.icone,
    notas: power.notas,
    domainName: DOMAIN_NAME_TO_PRISMA[power.dominio.name],
    domainAreaConhecimento: power.dominio.areaConhecimento || null,
    domainPeculiarId: power.dominio.peculiarId || null,
    parametrosAcao: power.parametros.acao,
    parametrosAlcance: power.parametros.alcance,
    parametrosDuracao: power.parametros.duracao,
    custoTotalPda: power.custoTotal.pda,
    custoTotalPe: power.custoTotal.pe,
    custoTotalEspacos: power.custoTotal.espacos,
    custoAlternativoTipo: alt?.tipo,
    custoAlternativoQuantidade: alt?.quantidade,
    custoAlternativoDescricao: alt?.descricao,
    custoAlternativoAtributo: alt?.atributo,
    custoAlternativoItemId: alt?.itemId,
    createdAt: power.createdAt,
    updatedAt: power.updatedAt,
    appliedEffects: { create: appliedEffects },
  };
}
