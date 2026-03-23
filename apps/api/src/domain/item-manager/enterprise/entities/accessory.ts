import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import {
  DurabilityStatus,
  Item,
  ItemType,
  validateItemBaseProps,
  type ItemBaseProps,
} from './item';
import { ItemPowerArrayIdList } from './watched-lists/item-power-array-id-list';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

// Acessórios não possuem campos próprios além da base — os efeitos passivos
// são representados pelos poderes referenciados via powerIds.
type AccessoryProps = ItemBaseProps;

export class Accessory extends Item<AccessoryProps> {
  get tipo(): ItemType {
    return ItemType.ACCESSORY;
  }

  update(partial: {
    nome?: string;
    descricao?: string;
    dominio?: Domain;
    custoBase?: number;
    nivelItem?: number;
    powerIds?: ItemPowerIdList;
    powerArrayIds?: ItemPowerArrayIdList;
    icone?: string | null;
    notas?: string;
    canStack?: boolean;
    maxStack?: number;
  }): Accessory {
    return Accessory.create(
      {
        userId: this.props.userId,
        characterId: this.props.characterId,
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
        canStack: partial.canStack ?? this.props.canStack,
        maxStack: partial.maxStack ?? this.props.maxStack,
        notas: partial.notas ?? this.props.notas,
        createdAt: this.props.createdAt,
        updatedAt: new Date(),
      },
      this.id,
    );
  }

  copyForUser(userId: string): Accessory {
    return Accessory.create({
      ...this.props,
      userId,
      characterId: undefined,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  copyForCharacter(characterId: string, userId: string): Accessory {
    return Accessory.create({
      ...this.props,
      userId,
      characterId,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): Accessory {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados públicos', 'isPublic');
    }

    return new Accessory({ ...this.props, isPublic: true, updatedAt: new Date() }, this.id);
  }

  makePrivate(): Accessory {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados privados', 'isPublic');
    }

    return new Accessory({ ...this.props, isPublic: false, updatedAt: new Date() }, this.id);
  }

  static create(
    props: Optional<
      AccessoryProps,
      'durabilidade' | 'isPublic' | 'createdAt' | 'powerIds' | 'powerArrayIds' | 'icone' | 'canStack' | 'maxStack'
    >,
    id?: UniqueEntityId,
  ): Accessory {
    const fullProps: AccessoryProps = {
      ...props,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      canStack: props.canStack ?? false,
      maxStack: props.maxStack ?? 2,
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      powerArrayIds: props.powerArrayIds ?? new ItemPowerArrayIdList(),
      createdAt: props.createdAt ?? new Date(),
    };

    validateItemBaseProps(fullProps);

    return new Accessory(fullProps, id);
  }
}
