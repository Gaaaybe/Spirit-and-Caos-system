import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import { DurabilityStatus, Item, type ItemBaseProps, ItemType, validateItemBaseProps } from './item';
import { UpgradeLevel } from './value-objects/upgrade-level';
import { ItemPowerArrayIdList } from './watched-lists/item-power-array-id-list';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

export enum EquipmentType {
  TRAJE = 'traje',
  PROTECAO = 'protecao',
}

export const DEFENSIVE_MAX_UPGRADE = 9;

interface DefensiveEquipmentProps extends ItemBaseProps {
  tipoEquipamento: EquipmentType;
  baseRD: number;
  upgradeLevel: UpgradeLevel;
  atributoEscalonamento?: string;
}

export class DefensiveEquipment extends Item<DefensiveEquipmentProps> {
  get tipo(): ItemType {
    return ItemType.DEFENSIVE_EQUIPMENT;
  }

  get tipoEquipamento(): EquipmentType {
    return this.props.tipoEquipamento;
  }

  get baseRD(): number {
    return this.props.baseRD;
  }

  get upgradeLevel(): UpgradeLevel {
    return this.props.upgradeLevel;
  }

  get atributoEscalonamento(): string | undefined {
    return this.props.atributoEscalonamento;
  }

  get rdAtual(): number {
    return this.props.baseRD * this.props.upgradeLevel.getMultiplier();
  }

  upgrade(): DefensiveEquipment {
    return new DefensiveEquipment(
      {
        ...this.props,
        upgradeLevel: this.props.upgradeLevel.increment(),
        updatedAt: new Date(),
      },
      this.id,
    );
  }

  update(partial: {
    nome?: string;
    descricao?: string;
    dominio?: Domain;
    custoBase?: number;
    nivelItem?: number;
    tipoEquipamento?: EquipmentType;
    baseRD?: number;
    atributoEscalonamento?: string;
    powerIds?: ItemPowerIdList;
    powerArrayIds?: ItemPowerArrayIdList;
    icone?: string;
    notas?: string;
  }): DefensiveEquipment {
    return DefensiveEquipment.create(
      {
        userId: this.props.userId,
        nome: partial.nome ?? this.props.nome,
        descricao: partial.descricao ?? this.props.descricao,
        dominio: partial.dominio ?? this.props.dominio,
        custoBase: partial.custoBase ?? this.props.custoBase,
        nivelItem: partial.nivelItem ?? this.props.nivelItem,
        durabilidade: this.props.durabilidade,
        powerIds: partial.powerIds ?? this.props.powerIds,
        powerArrayIds: partial.powerArrayIds ?? this.props.powerArrayIds,
        icone: partial.icone ?? this.props.icone,
        isPublic: this.props.isPublic,
        notas: partial.notas ?? this.props.notas,
        createdAt: this.props.createdAt,
        updatedAt: new Date(),
        tipoEquipamento: partial.tipoEquipamento ?? this.props.tipoEquipamento,
        baseRD: partial.baseRD ?? this.props.baseRD,
        upgradeLevel: this.props.upgradeLevel,
        atributoEscalonamento: partial.atributoEscalonamento ?? this.props.atributoEscalonamento,
      },
      this.id,
    );
  }

  copyForUser(userId: string): DefensiveEquipment {
    return DefensiveEquipment.create({
      ...this.props,
      userId,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): DefensiveEquipment {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados públicos', 'isPublic');
    }

    return new DefensiveEquipment(
      { ...this.props, isPublic: true, updatedAt: new Date() },
      this.id,
    );
  }

  makePrivate(): DefensiveEquipment {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados privados', 'isPublic');
    }

    return new DefensiveEquipment(
      { ...this.props, isPublic: false, updatedAt: new Date() },
      this.id,
    );
  }

  static create(
    props: Optional<
      DefensiveEquipmentProps,
      'durabilidade' | 'isPublic' | 'baseRD' | 'upgradeLevel' | 'createdAt' | 'powerIds' | 'powerArrayIds' | 'icone'
    >,
    id?: UniqueEntityId,
  ): DefensiveEquipment {
    const fullProps: DefensiveEquipmentProps = {
      ...props,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      baseRD: props.baseRD ?? 2,
      upgradeLevel: props.upgradeLevel ?? UpgradeLevel.create(0, DEFENSIVE_MAX_UPGRADE),
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      powerArrayIds: props.powerArrayIds ?? new ItemPowerArrayIdList(),
      createdAt: props.createdAt ?? new Date(),
    };

    validateItemBaseProps(fullProps);

    if (fullProps.baseRD < 1) {
      throw new DomainValidationError('RD base deve ser pelo menos 1', 'baseRD');
    }

    return new DefensiveEquipment(fullProps, id);
  }
}
