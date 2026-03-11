import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import { DurabilityStatus, Item, ItemType, validateItemBaseProps, type ItemBaseProps } from './item';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

interface AccessoryProps extends ItemBaseProps {
  efeitoPassivo: string;
}

export class Accessory extends Item<AccessoryProps> {
  get tipo(): ItemType {
    return ItemType.ACCESSORY;
  }

  get efeitoPassivo(): string {
    return this.props.efeitoPassivo;
  }

  update(partial: {
    nome?: string;
    descricao?: string;
    dominio?: Domain;
    custoBase?: number;
    nivelItem?: number;
    efeitoPassivo?: string;
    powerIds?: ItemPowerIdList;
    notas?: string;
  }): Accessory {
    return Accessory.create(
      {
        userId: this.props.userId,
        nome: partial.nome ?? this.props.nome,
        descricao: partial.descricao ?? this.props.descricao,
        dominio: partial.dominio ?? this.props.dominio,
        custoBase: partial.custoBase ?? this.props.custoBase,
        nivelItem: partial.nivelItem ?? this.props.nivelItem,
        maxStack: this.props.maxStack,
        durabilidade: this.props.durabilidade,
        powerIds: partial.powerIds ?? this.props.powerIds,
        isPublic: this.props.isPublic,
        notas: partial.notas ?? this.props.notas,
        createdAt: this.props.createdAt,
        updatedAt: new Date(),
        efeitoPassivo: partial.efeitoPassivo ?? this.props.efeitoPassivo,
      },
      this.id,
    );
  }

  copyForUser(userId: string): Accessory {
    return Accessory.create({
      ...this.props,
      userId,
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
      'maxStack' | 'durabilidade' | 'isPublic' | 'createdAt' | 'powerIds'
    >,
    id?: UniqueEntityId,
  ): Accessory {
    const fullProps: AccessoryProps = {
      ...props,
      maxStack: props.maxStack ?? 1,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      createdAt: props.createdAt ?? new Date(),
    };

    validateItemBaseProps(fullProps);

    if (!fullProps.efeitoPassivo || fullProps.efeitoPassivo.trim().length < 5) {
      throw new DomainValidationError(
        'Efeito passivo deve ter pelo menos 5 caracteres',
        'efeitoPassivo',
      );
    }

    return new Accessory(fullProps, id);
  }
}
