import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface AttributeProps {
  baseValue: number;
  extraBonus?: number;
}

export class Attribute {
  private readonly props: AttributeProps;

  private constructor(props: AttributeProps) {
    this.props = {
      baseValue: props.baseValue,
      extraBonus: props.extraBonus ?? 0,
    };
  }

  static create(props: AttributeProps): Attribute {
    if (props.baseValue < 0) {
      throw new DomainValidationError(
        'O valor base do atributo não pode ser negativo.',
        'baseValue',
      );
    }
    return new Attribute(props);
  }

  get baseValue(): number {
    return this.props.baseValue;
  }

  get extraBonus(): number {
    return this.props.extraBonus!;
  }

  get baseModifier(): number {
    return Math.ceil((this.baseValue - 10) / 2);
  }

  get rollModifier(): number {
    return this.baseModifier + this.extraBonus;
  }
}
