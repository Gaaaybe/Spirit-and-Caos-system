import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import { DurabilityStatus, Item, type ItemBaseProps, ItemType, validateItemBaseProps } from './item';
import type { DamageDescriptor } from './value-objects/damage-descriptor';
import { UpgradeLevel } from './value-objects/upgrade-level';
import { ItemPowerArrayIdList } from './watched-lists/item-power-array-id-list';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

export enum WeaponRange {
  CORPO_A_CORPO = 'corpo-a-corpo',
  CURTO = 'curto',
  MEDIO = 'medio',
  LONGO = 'longo',
}

export const WEAPON_MAX_UPGRADE = 7;

interface WeaponProps extends ItemBaseProps {
  danos: DamageDescriptor[];
  upgradeLevel: UpgradeLevel;
  critMargin: number;
  critMultiplier: number;
  alcance: WeaponRange;
  atributoEscalonamento?: string;
}

export class Weapon extends Item<WeaponProps> {
  get tipo(): ItemType {
    return ItemType.WEAPON;
  }

  get danos(): DamageDescriptor[] {
    return this.props.danos;
  }

  get danoPrimario(): DamageDescriptor {
    return this.props.danos[0];
  }

  get upgradeLevel(): UpgradeLevel {
    return this.props.upgradeLevel;
  }

  get critMargin(): number {
    return this.props.critMargin;
  }

  get critMultiplier(): number {
    return this.props.critMultiplier;
  }

  get alcance(): WeaponRange {
    return this.props.alcance;
  }

  get atributoEscalonamento(): string | undefined {
    return this.props.atributoEscalonamento;
  }

  upgrade(): Weapon {
    return new Weapon(
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
    danos?: DamageDescriptor[];
    critMargin?: number;
    critMultiplier?: number;
    alcance?: WeaponRange;
    atributoEscalonamento?: string;
    powerIds?: ItemPowerIdList;
    powerArrayIds?: ItemPowerArrayIdList;
    icone?: string | null;
    notas?: string;
  }): Weapon {
    return Weapon.create(
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
        icone: partial.icone === undefined ? this.props.icone : (partial.icone ?? undefined),
        isPublic: this.props.isPublic,
        notas: partial.notas ?? this.props.notas,
        createdAt: this.props.createdAt,
        updatedAt: new Date(),
        danos: partial.danos ?? this.props.danos,
        upgradeLevel: this.props.upgradeLevel,
        critMargin: partial.critMargin ?? this.props.critMargin,
        critMultiplier: partial.critMultiplier ?? this.props.critMultiplier,
        alcance: partial.alcance ?? this.props.alcance,
        atributoEscalonamento: partial.atributoEscalonamento ?? this.props.atributoEscalonamento,
      },
      this.id,
    );
  }

  copyForUser(userId: string): Weapon {
    return Weapon.create({
      ...this.props,
      userId,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): Weapon {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados públicos', 'isPublic');
    }

    return new Weapon({ ...this.props, isPublic: true, updatedAt: new Date() }, this.id);
  }

  makePrivate(): Weapon {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados privados', 'isPublic');
    }

    return new Weapon({ ...this.props, isPublic: false, updatedAt: new Date() }, this.id);
  }

  static create(
    props: Optional<
      WeaponProps,
      'durabilidade' | 'isPublic' | 'upgradeLevel' | 'createdAt' | 'powerIds' | 'powerArrayIds' | 'icone'
    >,
    id?: UniqueEntityId,
  ): Weapon {
    const fullProps: WeaponProps = {
      ...props,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      upgradeLevel: props.upgradeLevel ?? UpgradeLevel.create(0, WEAPON_MAX_UPGRADE),
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      powerArrayIds: props.powerArrayIds ?? new ItemPowerArrayIdList(),
      createdAt: props.createdAt ?? new Date(),
    };

    validateItemBaseProps(fullProps);

    if (fullProps.danos.length === 0) {
      throw new DomainValidationError('A arma deve ter pelo menos um tipo de dano', 'danos');
    }

    if (fullProps.critMargin < 2 || fullProps.critMargin > 20) {
      throw new DomainValidationError('Margem de crítico deve ser entre 2 e 20', 'critMargin');
    }

    if (fullProps.critMultiplier < 1 || fullProps.critMultiplier > 7) {
      throw new DomainValidationError(
        'Multiplicador de crítico deve ser entre 1 e 7',
        'critMultiplier',
      );
    }

    return new Weapon(fullProps, id);
  }
}
