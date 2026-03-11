import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import type { Domain } from '@/domain/shared/enterprise/value-objects/domain';
import { DurabilityStatus, Item, type ItemBaseProps, ItemType, validateItemBaseProps } from './item';
import { ItemPowerIdList } from './watched-lists/item-power-id-list';

export enum SpoilageState {

  PERFEITA = 'PERFEITA',
  BOA = 'BOA',
  NORMAL = 'NORMAL',
  RUIM = 'RUIM',
  TERRIVEL = 'TERRIVEL',
}

const SPOILAGE_PROGRESSION: SpoilageState[] = [
  SpoilageState.PERFEITA,
  SpoilageState.BOA,
  SpoilageState.NORMAL,
  SpoilageState.RUIM,
  SpoilageState.TERRIVEL,
];

interface ConsumableProps extends ItemBaseProps {
  descritorEfeito: string;
  qtdDoses: number;
  isRefeicao: boolean;
  spoilageState?: SpoilageState;
}

export class Consumable extends Item<ConsumableProps> {
  get tipo(): ItemType {
    return ItemType.CONSUMABLE;
  }

  get descritorEfeito(): string {
    return this.props.descritorEfeito;
  }

  get qtdDoses(): number {
    return this.props.qtdDoses;
  }

  get isRefeicao(): boolean {
    return this.props.isRefeicao;
  }

  get spoilageState(): SpoilageState | undefined {
    return this.props.spoilageState;
  }

  advanceSpoilage(): Consumable {
    if (!this.props.isRefeicao || this.props.spoilageState === undefined) {
      throw new DomainValidationError(
        'Deterioração só se aplica a consumíveis do tipo refeição',
        'spoilageState',
      );
    }

    const currentIndex = SPOILAGE_PROGRESSION.indexOf(this.props.spoilageState);
    const nextState = SPOILAGE_PROGRESSION[currentIndex + 1] ?? SpoilageState.TERRIVEL;

    return new Consumable(
      { ...this.props, spoilageState: nextState, updatedAt: new Date() },
      this.id,
    );
  }

  consumir(quantidade: number): Consumable {
    if (quantidade < 1 || quantidade > this.props.qtdDoses) {
      throw new DomainValidationError(
        `Quantidade inválida. Doses disponíveis: ${this.props.qtdDoses}`,
        'qtdDoses',
      );
    }

    return new Consumable(
      { ...this.props, qtdDoses: this.props.qtdDoses - quantidade, updatedAt: new Date() },
      this.id,
    );
  }

  update(partial: {
    nome?: string;
    descricao?: string;
    dominio?: Domain;
    custoBase?: number;
    nivelItem?: number;
    descritorEfeito?: string;
    qtdDoses?: number;
    powerIds?: ItemPowerIdList;
    notas?: string;
  }): Consumable {
    return Consumable.create(
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
        descritorEfeito: partial.descritorEfeito ?? this.props.descritorEfeito,
        qtdDoses: partial.qtdDoses ?? this.props.qtdDoses,
        isRefeicao: this.props.isRefeicao,
        spoilageState: this.props.spoilageState,
      },
      this.id,
    );
  }

  copyForUser(userId: string): Consumable {
    return Consumable.create({
      ...this.props,
      userId,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): Consumable {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados públicos', 'isPublic');
    }

    return new Consumable({ ...this.props, isPublic: true, updatedAt: new Date() }, this.id);
  }

  makePrivate(): Consumable {
    if (this.isOfficial()) {
      throw new DomainValidationError('Itens oficiais não podem ser tornados privados', 'isPublic');
    }

    return new Consumable({ ...this.props, isPublic: false, updatedAt: new Date() }, this.id);
  }

  static create(
    props: Optional<ConsumableProps, 'maxStack' | 'durabilidade' | 'isPublic' | 'createdAt' | 'powerIds' | 'spoilageState'>,
    id?: UniqueEntityId,
  ): Consumable {
    const fullProps: ConsumableProps = {
      ...props,
      maxStack: props.maxStack ?? 99,
      durabilidade: props.durabilidade ?? DurabilityStatus.INTACTO,
      isPublic: props.isPublic ?? false,
      powerIds: props.powerIds ?? new ItemPowerIdList(),
      createdAt: props.createdAt ?? new Date(),
      spoilageState: props.isRefeicao
        ? (props.spoilageState ?? SpoilageState.BOA)
        : undefined,
    };

    validateItemBaseProps(fullProps);

    if (fullProps.qtdDoses < 1) {
      throw new DomainValidationError('Quantidade de doses deve ser pelo menos 1', 'qtdDoses');
    }

    if (fullProps.isRefeicao && fullProps.qtdDoses > 10) {
      throw new DomainValidationError(
        'Refeições podem ter no máximo 10 doses por descanso',
        'qtdDoses',
      );
    }

    if (!fullProps.isRefeicao && fullProps.spoilageState !== undefined) {
      throw new DomainValidationError(
        'Estado de deterioração só é válido para refeições',
        'spoilageState',
      );
    }

    const consumable = new Consumable(fullProps, id);

    return consumable;
  }
}
