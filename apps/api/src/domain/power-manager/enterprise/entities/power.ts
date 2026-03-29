import { OwnableEntity } from '@/core/entities/ownable-entity';
import type { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Optional } from '@/core/types/optional';
import { PowerMadePublicEvent } from '../events/power-made-public-event';
import type { AppliedEffect } from './applied-effect';
import type { AlternativeCost } from './value-objects/alternative-cost';
import type { AppliedModification } from './value-objects/applied-modification';
import type { Domain } from './value-objects/domain';
import type { PowerCost } from './value-objects/power-cost';
import type { PowerParameters } from './value-objects/power-parameters';
import { PowerEffectList } from './watched-lists/power-effect-list';
import { PowerGlobalModificationList } from './watched-lists/power-global-modification-list';

interface PowerProps {
  userId?: string;
  characterId?: string;
  nome: string;
  descricao: string;
  dominio: Domain;
  parametros: PowerParameters;
  effects: PowerEffectList;
  globalModifications: PowerGlobalModificationList;
  custoTotal: PowerCost;
  custoAlternativo?: AlternativeCost;
  isPublic: boolean;
  icone?: string;
  notas?: string;
  userName?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Power extends OwnableEntity<PowerProps> {
  get userId(): string | undefined {
    return this.props.userId;
  }

  get characterId(): string | undefined {
    return this.props.characterId;
  }

  get nome(): string {
    return this.props.nome;
  }

  get descricao(): string {
    return this.props.descricao;
  }

  get dominio(): Domain {
    return this.props.dominio;
  }

  get parametros(): PowerParameters {
    return this.props.parametros;
  }

  get effects(): PowerEffectList {
    return this.props.effects;
  }

  get globalModifications(): PowerGlobalModificationList {
    return this.props.globalModifications;
  }

  get custoTotal(): PowerCost {
    return this.props.custoTotal;
  }

  get custoAlternativo(): AlternativeCost | undefined {
    return this.props.custoAlternativo;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  get icone(): string | undefined {
    return this.props.icone;
  }

  get notas(): string | undefined {
    return this.props.notas;
  }

  get userName(): string | undefined {
    return this.props.userName;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  copyForCharacter(characterId: string, userId: string): Power {
    const effectsList = new PowerEffectList();
    effectsList.update(this.effects.getItems());

    const globalModificationsList = new PowerGlobalModificationList();
    globalModificationsList.update(this.globalModifications.getItems());

    return Power.create({
      ...this.props,
      userId,
      characterId,
      effects: effectsList,
      globalModifications: globalModificationsList,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: undefined,
    });
  }

  makePublic(): Power {
    if (this.isOfficial()) {
      throw new DomainValidationError(
        'Poderes oficiais não podem ser tornados públicos',
        'isPublic',
      );
    }

    const power = new Power(
      {
        ...this.props,
        isPublic: true,
        updatedAt: new Date(),
      },
      this.id,
    );

    power.addDomainEvent(new PowerMadePublicEvent(power));

    return power;
  }

  makePrivate(): Power {
    if (this.isOfficial()) {
      throw new DomainValidationError(
        'Poderes oficiais não podem ser tornados privados',
        'isPublic',
      );
    }

    return new Power(
      {
        ...this.props,
        isPublic: false,
        updatedAt: new Date(),
      },
      this.id,
    );
  }

  getReferencedPeculiarityId(): string | undefined {
    if (this.props.dominio.isPeculiar()) {
      return this.props.dominio.peculiarId;
    }
    return undefined;
  }

  hasGlobalModifications(): boolean {
    return this.props.globalModifications.getItems().length > 0;
  }

  update(partial: {
    nome?: string;
    descricao?: string;
    dominio?: Domain;
    parametros?: PowerParameters;
    effects?: AppliedEffect[];
    globalModifications?: AppliedModification[];
    custoTotal?: PowerCost;
    custoAlternativo?: AlternativeCost;
    icone?: string | null;
    notas?: string;
  }): Power {
    let newEffects = this.props.effects;
    if (partial.effects !== undefined) {
      newEffects = new PowerEffectList();
      newEffects.update(partial.effects);
    }

    let newGlobalMods = this.props.globalModifications;
    if (partial.globalModifications !== undefined) {
      newGlobalMods = new PowerGlobalModificationList();
      newGlobalMods.update(partial.globalModifications);
    }

    return Power.create(
      {
        userId: this.props.userId,
        characterId: this.props.characterId,
        nome: partial.nome ?? this.props.nome,
        descricao: partial.descricao ?? this.props.descricao,
        dominio: partial.dominio ?? this.props.dominio,
        parametros: partial.parametros ?? this.props.parametros,
        effects: newEffects,
        globalModifications: newGlobalMods,
        custoTotal: partial.custoTotal ?? this.props.custoTotal,
        custoAlternativo: partial.custoAlternativo ?? this.props.custoAlternativo,
        icone: partial.icone === undefined ? this.props.icone : (partial.icone ?? undefined),
        notas: partial.notas ?? this.props.notas,
        isPublic: this.props.isPublic,
        createdAt: this.props.createdAt,
        updatedAt: new Date(),
      },
      this.id,
    );
  }

  private static validate(props: PowerProps): void {
    if (!props.nome || props.nome.trim() === '') {
      throw new DomainValidationError('Nome do poder é obrigatório', 'nome');
    }

    if (props.nome.length > 100) {
      throw new DomainValidationError('Nome do poder não pode exceder 100 caracteres', 'nome');
    }

    if (!props.descricao || props.descricao.trim() === '') {
      throw new DomainValidationError('Descrição do poder é obrigatória', 'descricao');
    }

    const effectItems = props.effects.getItems();

    if (effectItems.length === 0) {
      throw new DomainValidationError('Um poder deve ter pelo menos um efeito', 'effects');
    }

    if (effectItems.length > 20) {
      throw new DomainValidationError(
        'Um poder não pode ter mais de 20 efeitos vinculados',
        'effects',
      );
    }

    const globalModItems = props.globalModifications.getItems();
    if (globalModItems.length > 50) {
      throw new DomainValidationError(
        'Um poder não pode ter mais de 50 modificações globais',
        'globalModifications',
      );
    }
  }

  static create(
    props: Optional<
      PowerProps,
      'isPublic' | 'createdAt' | 'notas' | 'icone' | 'globalModifications'
    >,
    id?: UniqueEntityId,
  ): Power {
    const power = new Power(
      {
        ...props,
        isPublic: props.isPublic ?? false,
        createdAt: props.createdAt ?? new Date(),
        notas: props.notas,
        globalModifications: props.globalModifications ?? new PowerGlobalModificationList(),
      },
      id,
    );

    Power.validate(power.props);

    return power;
  }

  static createOfficial(
    props: Omit<
      PowerProps,
      'userId' | 'isPublic' | 'createdAt' | 'notas' | 'globalModifications' | 'updatedAt'
    > &
      Partial<Pick<PowerProps, 'notas' | 'globalModifications'>>,
    id?: UniqueEntityId,
  ): Power {
    return Power.create(
      {
        ...props,
        userId: undefined,
        isPublic: false,
      },
      id,
    );
  }
}
