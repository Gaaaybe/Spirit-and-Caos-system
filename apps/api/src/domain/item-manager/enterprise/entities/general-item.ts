import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import {
  DurabilityStatus,
  Item,
  type ItemBaseProps,
  ItemType,
  validateItemBaseProps,
} from './item';
import { ItemPowerArrayIdList } from './watched-lists/item-power-array-id-list';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

type GeneralItemProps = ItemBaseProps;

export class GeneralItem extends Item<GeneralItemProps> {
  get tipo(): ItemType {
    return ItemType.GENERAL;
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
  }): GeneralItem {
    return GeneralItem.create(
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

  copyForUser(userId: string): GeneralItem {
    return GeneralItem.create({
      ...this.props,
      userId,
      characterId: undefined,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  copyForCharacter(characterId: string, userId: string): GeneralItem {
    return GeneralItem.create({
      ...this.props,
      userId,
      characterId,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): GeneralItem {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados públicos', 'isPublic');
    }

    return new GeneralItem({ ...this.props, isPublic: true, updatedAt: new Date() }, this.id);
  }

  makePrivate(): GeneralItem {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados privados', 'isPublic');
    }

    return new GeneralItem({ ...this.props, isPublic: false, updatedAt: new Date() }, this.id);
  }

  static create(
    props: Optional<
      GeneralItemProps,
      'durabilidade' | 'isPublic' | 'createdAt' | 'powerIds' | 'powerArrayIds' | 'icone' | 'canStack' | 'maxStack'
    >,
    id?: UniqueEntityId,
  ): GeneralItem {
    const fullProps: GeneralItemProps = {
      ...props,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      canStack: props.canStack ?? true,
      maxStack: props.maxStack ?? 5,
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      powerArrayIds: props.powerArrayIds ?? new ItemPowerArrayIdList(),
      createdAt: props.createdAt ?? new Date(),
    };

    validateItemBaseProps(fullProps);

    return new GeneralItem(fullProps, id);
  }
}
