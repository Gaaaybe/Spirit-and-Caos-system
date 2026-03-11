import type {
  Prisma,
  DomainName as PrismaDomainName,
  ItemType as PrismaItemType,
  WeaponRange as PrismaWeaponRange,
  EquipmentType as PrismaEquipmentType,
  DurabilityStatus as PrismaDurabilityStatus,
  SpoilageState as PrismaSpoilageState,
} from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Accessory } from '@/domain/item-manager/enterprise/entities/accessory';
import { Artifact } from '@/domain/item-manager/enterprise/entities/artifact';
import { Consumable, SpoilageState } from '@/domain/item-manager/enterprise/entities/consumable';
import {
  DefensiveEquipment,
  EquipmentType,
} from '@/domain/item-manager/enterprise/entities/defensive-equipment';
import type { Item, ItemBaseProps } from '@/domain/item-manager/enterprise/entities/item';
import { DurabilityStatus, ItemType } from '@/domain/item-manager/enterprise/entities/item';
import { Weapon, WeaponRange } from '@/domain/item-manager/enterprise/entities/weapon';
import { DamageDescriptor } from '@/domain/item-manager/enterprise/entities/value-objects/damage-descriptor';
import { UpgradeLevel } from '@/domain/item-manager/enterprise/entities/value-objects/upgrade-level';
import { ItemPowerIdList } from '@/domain/item-manager/enterprise/entities/watched-lists/item-power-id-list';
import {
  Domain,
  DomainName,
} from '@/domain/shared/enterprise/value-objects/domain';

// ─── Type helpers ────────────────────────────────────────────────────────────

export type PrismaItemFull = Prisma.ItemGetPayload<{
  include: { itemDamages: true; itemPowers: true };
}>;

// ─── Lookup tables ───────────────────────────────────────────────────────────

const DOMAIN_TO_DOMAIN: Record<PrismaDomainName, DomainName> = {
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

const DOMAIN_TO_PRISMA: Record<DomainName, PrismaDomainName> = {
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

const ITEM_TYPE_TO_DOMAIN: Record<PrismaItemType, ItemType> = {
  WEAPON: ItemType.WEAPON,
  DEFENSIVE_EQUIPMENT: ItemType.DEFENSIVE_EQUIPMENT,
  CONSUMABLE: ItemType.CONSUMABLE,
  ARTIFACT: ItemType.ARTIFACT,
  ACCESSORY: ItemType.ACCESSORY,
};

const ITEM_TYPE_TO_PRISMA: Record<ItemType, PrismaItemType> = {
  [ItemType.WEAPON]: 'WEAPON',
  [ItemType.DEFENSIVE_EQUIPMENT]: 'DEFENSIVE_EQUIPMENT',
  [ItemType.CONSUMABLE]: 'CONSUMABLE',
  [ItemType.ARTIFACT]: 'ARTIFACT',
  [ItemType.ACCESSORY]: 'ACCESSORY',
};

const WEAPON_RANGE_TO_DOMAIN: Record<PrismaWeaponRange, WeaponRange> = {
  CORPO_A_CORPO: WeaponRange.CORPO_A_CORPO,
  CURTO: WeaponRange.CURTO,
  MEDIO: WeaponRange.MEDIO,
  LONGO: WeaponRange.LONGO,
};

const WEAPON_RANGE_TO_PRISMA: Record<WeaponRange, PrismaWeaponRange> = {
  [WeaponRange.CORPO_A_CORPO]: 'CORPO_A_CORPO',
  [WeaponRange.CURTO]: 'CURTO',
  [WeaponRange.MEDIO]: 'MEDIO',
  [WeaponRange.LONGO]: 'LONGO',
};

const EQUIPMENT_TYPE_TO_DOMAIN: Record<PrismaEquipmentType, EquipmentType> = {
  TRAJE: EquipmentType.TRAJE,
  PROTECAO: EquipmentType.PROTECAO,
};

const EQUIPMENT_TYPE_TO_PRISMA: Record<EquipmentType, PrismaEquipmentType> = {
  [EquipmentType.TRAJE]: 'TRAJE',
  [EquipmentType.PROTECAO]: 'PROTECAO',
};

const DURABILITY_TO_DOMAIN: Record<PrismaDurabilityStatus, DurabilityStatus> = {
  INTACTO: DurabilityStatus.INTACTO,
  DANIFICADO: DurabilityStatus.DANIFICADO,
};

const DURABILITY_TO_PRISMA: Record<DurabilityStatus, PrismaDurabilityStatus> = {
  [DurabilityStatus.INTACTO]: 'INTACTO',
  [DurabilityStatus.DANIFICADO]: 'DANIFICADO',
};

const SPOILAGE_TO_DOMAIN: Record<PrismaSpoilageState, SpoilageState> = {
  PERFEITA: SpoilageState.PERFEITA,
  BOA: SpoilageState.BOA,
  NORMAL: SpoilageState.NORMAL,
  RUIM: SpoilageState.RUIM,
  TERRIVEL: SpoilageState.TERRIVEL,
};

const SPOILAGE_TO_PRISMA: Record<SpoilageState, PrismaSpoilageState> = {
  [SpoilageState.PERFEITA]: 'PERFEITA',
  [SpoilageState.BOA]: 'BOA',
  [SpoilageState.NORMAL]: 'NORMAL',
  [SpoilageState.RUIM]: 'RUIM',
  [SpoilageState.TERRIVEL]: 'TERRIVEL',
};

// ─── toDomain ────────────────────────────────────────────────────────────────

export function toDomain(raw: PrismaItemFull): Item<ItemBaseProps> {
  const entityId = new UniqueEntityId(raw.id);

  const dominio = Domain.create({
    name: DOMAIN_TO_DOMAIN[raw.domainName],
    areaConhecimento: raw.domainAreaConhecimento ?? undefined,
    peculiarId: raw.domainPeculiarId ?? undefined,
  });

  const powerIdList = new ItemPowerIdList();
  const sortedPowerIds = [...raw.itemPowers].sort((a, b) => a.posicao - b.posicao);
  powerIdList.update(sortedPowerIds.map((ip) => new UniqueEntityId(ip.powerId)));

  const base = {
    userId: raw.userId ?? undefined,
    nome: raw.nome,
    descricao: raw.descricao,
    dominio,
    custoBase: raw.custoBase,
    nivelItem: raw.nivelItem,
    maxStack: raw.maxStack,
    durabilidade: DURABILITY_TO_DOMAIN[raw.durabilidade],
    powerIds: powerIdList,
    isPublic: raw.isPublic,
    notas: raw.notas ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt ?? undefined,
  };

  const tipo = ITEM_TYPE_TO_DOMAIN[raw.tipo];

  switch (tipo) {
    case ItemType.WEAPON: {
      const sortedDamages = [...raw.itemDamages].sort((a, b) => a.posicao - b.posicao);
      return Weapon.create(
        {
          ...base,
          danos: sortedDamages.map((d) =>
            DamageDescriptor.create(d.dado, d.base, d.espiritual),
          ),
          upgradeLevel: UpgradeLevel.create(raw.upgradeLevelValue ?? 0, raw.upgradeLevelMax ?? 7),
          critMargin: raw.critMargin!,
          critMultiplier: raw.critMultiplier!,
          alcance: WEAPON_RANGE_TO_DOMAIN[raw.alcance!],
          atributoEscalonamento: raw.atributoEscalonamento ?? undefined,
        },
        entityId,
      );
    }

    case ItemType.DEFENSIVE_EQUIPMENT:
      return DefensiveEquipment.create(
        {
          ...base,
          tipoEquipamento: EQUIPMENT_TYPE_TO_DOMAIN[raw.tipoEquipamento!],
          baseRD: raw.critMargin ?? 2, // reuses critMargin slot — see toPrisma
          upgradeLevel: UpgradeLevel.create(raw.upgradeLevelValue ?? 0, raw.upgradeLevelMax ?? 9),
          atributoEscalonamento: raw.atributoEscalonamento ?? undefined,
        },
        entityId,
      );

    case ItemType.CONSUMABLE:
      return Consumable.create(
        {
          ...base,
          descritorEfeito: raw.descritorEfeito!,
          qtdDoses: raw.qtdDoses!,
          isRefeicao: raw.isRefeicao!,
          spoilageState: raw.spoilageState
            ? SPOILAGE_TO_DOMAIN[raw.spoilageState]
            : undefined,
        },
        entityId,
      );

    case ItemType.ARTIFACT:
      return Artifact.create(
        {
          ...base,
          isAttuned: raw.isAttuned ?? false,
        },
        entityId,
      );

    case ItemType.ACCESSORY:
      return Accessory.create(
        {
          ...base,
          efeitoPassivo: raw.efeitoPassivo!,
        },
        entityId,
      );
  }
}

// ─── toPrisma ────────────────────────────────────────────────────────────────

export function toPrisma(item: Item<ItemBaseProps>): Prisma.ItemUncheckedCreateInput {
  const id = item.id.toString();

  const base: Prisma.ItemUncheckedCreateInput = {
    id,
    userId: item.userId ?? null,
    tipo: ITEM_TYPE_TO_PRISMA[item.tipo],
    nome: item.nome,
    descricao: item.descricao,
    isPublic: item.isPublic,
    notas: item.notas ?? null,
    durabilidade: DURABILITY_TO_PRISMA[item.durabilidade],
    domainName: DOMAIN_TO_PRISMA[item.dominio.name],
    domainAreaConhecimento: item.dominio.areaConhecimento ?? null,
    domainPeculiarId: item.dominio.peculiarId ?? null,
    custoBase: item.custoBase,
    nivelItem: item.nivelItem,
    maxStack: item.maxStack,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt ?? null,
    itemPowers: {
      create: item.powerIds.getItems().map((uid, i) => ({
        powerId: uid.toString(),
        posicao: i,
      })),
    },
  };

  if (item instanceof Weapon) {
    const sortedDanos = item.danos;
    return {
      ...base,
      critMargin: item.critMargin,
      critMultiplier: item.critMultiplier,
      alcance: WEAPON_RANGE_TO_PRISMA[item.alcance],
      atributoEscalonamento: item.atributoEscalonamento ?? null,
      upgradeLevelValue: item.upgradeLevel.value,
      upgradeLevelMax: item.upgradeLevel.maxLevel,
      itemDamages: {
        create: sortedDanos.map((d, i) => ({
          dado: d.dado,
          base: d.base,
          espiritual: d.espiritual,
          posicao: i,
        })),
      },
    };
  }

  if (item instanceof DefensiveEquipment) {
    return {
      ...base,
      tipoEquipamento: EQUIPMENT_TYPE_TO_PRISMA[item.tipoEquipamento],
      critMargin: item.baseRD, // reuse slot for baseRD (weapon-only field semantically)
      atributoEscalonamento: item.atributoEscalonamento ?? null,
      upgradeLevelValue: item.upgradeLevel.value,
      upgradeLevelMax: item.upgradeLevel.maxLevel,
    };
  }

  if (item instanceof Consumable) {
    return {
      ...base,
      descritorEfeito: item.descritorEfeito,
      qtdDoses: item.qtdDoses,
      isRefeicao: item.isRefeicao,
      spoilageState: item.spoilageState ? SPOILAGE_TO_PRISMA[item.spoilageState] : null,
    };
  }

  if (item instanceof Artifact) {
    return { ...base, isAttuned: item.isAttuned };
  }

  if (item instanceof Accessory) {
    return { ...base, efeitoPassivo: item.efeitoPassivo };
  }

  return base;
}
