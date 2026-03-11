import { Accessory } from '@/domain/item-manager/enterprise/entities/accessory';
import { Artifact } from '@/domain/item-manager/enterprise/entities/artifact';
import { Consumable } from '@/domain/item-manager/enterprise/entities/consumable';
import { DefensiveEquipment } from '@/domain/item-manager/enterprise/entities/defensive-equipment';
import type { Item, ItemBaseProps } from '@/domain/item-manager/enterprise/entities/item';
import { Weapon } from '@/domain/item-manager/enterprise/entities/weapon';

export class ItemPresenter {
  static toHTTP(item: Item<ItemBaseProps>) {
    const base = {
      id: item.id.toString(),
      userId: item.userId ?? null,
      tipo: item.tipo,
      nome: item.nome,
      descricao: item.descricao,
      isPublic: item.isPublic,
      notas: item.notas ?? null,
      dominio: {
        name: item.dominio.name,
        areaConhecimento: item.dominio.areaConhecimento ?? null,
        peculiarId: item.dominio.peculiarId ?? null,
      },
      custoBase: item.custoBase,
      nivelItem: item.nivelItem,
      valorBase: item.valorBase,
      precoVenda: item.precoVenda,
      maxStack: item.maxStack,
      durabilidade: item.durabilidade,
      powerIds: item.powerIds.getItems().map((uid) => uid.toString()),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt ?? null,
    };

    if (item instanceof Weapon) {
      return {
        ...base,
        danos: item.danos.map((d) => ({
          dado: d.dado,
          base: d.base,
          espiritual: d.espiritual,
        })),
        upgradeLevel: item.upgradeLevel.value,
        upgradeLevelMax: item.upgradeLevel.maxLevel,
        critMargin: item.critMargin,
        critMultiplier: item.critMultiplier,
        alcance: item.alcance,
        atributoEscalonamento: item.atributoEscalonamento ?? null,
      };
    }

    if (item instanceof DefensiveEquipment) {
      return {
        ...base,
        tipoEquipamento: item.tipoEquipamento,
        baseRD: item.baseRD,
        rdAtual: item.rdAtual,
        upgradeLevel: item.upgradeLevel.value,
        upgradeLevelMax: item.upgradeLevel.maxLevel,
        atributoEscalonamento: item.atributoEscalonamento ?? null,
      };
    }

    if (item instanceof Consumable) {
      return {
        ...base,
        descritorEfeito: item.descritorEfeito,
        qtdDoses: item.qtdDoses,
        isRefeicao: item.isRefeicao,
        spoilageState: item.spoilageState ?? null,
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
}
