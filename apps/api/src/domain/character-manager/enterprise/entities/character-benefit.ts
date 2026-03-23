import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface CharacterBenefitProps {
  name: string;
  degree: number;
  pdaCost: number;
}

export class CharacterBenefit extends Entity<CharacterBenefitProps> {
  static create(props: CharacterBenefitProps, id?: UniqueEntityId): CharacterBenefit {
    if (props.degree < 1) {
      throw new DomainValidationError('O grau do benefício deve ser pelo menos 1.', 'degree');
    }

    if (!props.name || props.name.trim() === '') {
      throw new DomainValidationError('O nome do benefício é obrigatório.', 'name');
    }

    if (props.pdaCost < 0) {
      throw new DomainValidationError('O custo do benefício não pode ser negativo.', 'pdaCost');
    }

    return new CharacterBenefit(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get degree(): number {
    return this.props.degree;
  }

  get pdaCost(): number {
    return this.props.pdaCost;
  }
}
