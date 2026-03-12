import type { Prisma } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { PowerArray } from '@/domain/power-manager/enterprise/entities/power-array';
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
import { PowerArrayPowerList } from '@/domain/power-manager/enterprise/entities/watched-lists/power-array-power-list';
import type { PrismaPowerFull } from './prisma-power-mapper';
import * as PowerMapper from './prisma-power-mapper';

export type PrismaPowerArrayFull = Prisma.PowerArrayGetPayload<{
  include: {
    powerArrayPowers: {
      include: {
        power: { include: { appliedEffects: { include: { appliedModifications: true } } } };
      };
    };
  };
}>;

const DOMAIN_NAME_TO_DOMAIN: Record<string, DomainName> = {
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
};

const DOMAIN_NAME_TO_PRISMA: Record<DomainName, string> = {
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
};

export function toDomain(raw: PrismaPowerArrayFull): PowerArray {
  const sortedPowers = [...raw.powerArrayPowers]
    .sort((a, b) => a.posicao - b.posicao)
    .map((pap) => PowerMapper.toDomain(pap.power as PrismaPowerFull));

  const powerList = new PowerArrayPowerList();
  powerList.update(sortedPowers);

  const dominio = Domain.create({
    name: DOMAIN_NAME_TO_DOMAIN[raw.domainName],
    areaConhecimento: raw.domainAreaConhecimento ?? undefined,
    peculiarId: raw.domainPeculiarId ?? undefined,
  });

  const parametrosBase =
    raw.parametrosBaseAcao !== null &&
    raw.parametrosBaseAlcance !== null &&
    raw.parametrosBaseDuracao !== null
      ? PowerParameters.create({
          acao: raw.parametrosBaseAcao as ActionType,
          alcance: raw.parametrosBaseAlcance as RangeType,
          duracao: raw.parametrosBaseDuracao as DurationType,
        })
      : undefined;

  const custoTotal = PowerCost.create({
    pda: raw.custoTotalPda,
    pe: raw.custoTotalPe,
    espacos: raw.custoTotalEspacos,
  });

  return PowerArray.create(
    {
      userId: raw.userId ?? undefined,
      nome: raw.nome,
      descricao: raw.descricao,
      dominio,
      parametrosBase,
      powers: powerList,
      custoTotal,
      isPublic: raw.isPublic,
      icone: raw.icone ?? undefined,
      notas: raw.notas ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt ?? undefined,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(powerArray: PowerArray): Prisma.PowerArrayUncheckedCreateInput {
  const id = powerArray.id.toString();
  const pb = powerArray.parametrosBase;

  return {
    id,
    userId: powerArray.userId,
    nome: powerArray.nome,
    descricao: powerArray.descricao,
    isPublic: powerArray.isPublic,
    icone: powerArray.icone,
    notas: powerArray.notas,
    domainName: DOMAIN_NAME_TO_PRISMA[
      powerArray.dominio.name
    ] as Prisma.PowerArrayUncheckedCreateInput['domainName'],
    domainAreaConhecimento: powerArray.dominio.areaConhecimento,
    domainPeculiarId: powerArray.dominio.peculiarId,
    parametrosBaseAcao: pb?.acao ?? null,
    parametrosBaseAlcance: pb?.alcance ?? null,
    parametrosBaseDuracao: pb?.duracao ?? null,
    custoTotalPda: powerArray.custoTotal.pda,
    custoTotalPe: powerArray.custoTotal.pe,
    custoTotalEspacos: powerArray.custoTotal.espacos,
    createdAt: powerArray.createdAt,
    updatedAt: powerArray.updatedAt,
    powerArrayPowers: {
      create: powerArray.powers.getItems().map((power, i) => ({
        powerId: power.id.toString(),
        posicao: i,
      })),
    },
  };
}
