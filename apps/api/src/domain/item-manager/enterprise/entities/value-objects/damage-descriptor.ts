import { DomainValidationError } from '@/core/errors/domain-validation-error';

export const STANDARD_DAMAGE_TYPES = ['corte', 'perfuração', 'impacto'] as const;
export type StandardDamageType = (typeof STANDARD_DAMAGE_TYPES)[number];

const DADO_REGEX = /^\d+d\d+$/;

interface DamageDescriptorProps {
  dado: string;
  base: string;
  espiritual: boolean;
}

export class DamageDescriptor {
  private readonly props: DamageDescriptorProps;

  private constructor(props: DamageDescriptorProps) {
    this.props = props;
  }

  get dado(): string {
    return this.props.dado;
  }

  get base(): string {
    return this.props.base;
  }

  get espiritual(): boolean {
    return this.props.espiritual;
  }

  isStandardType(): this is { base: StandardDamageType } {
    return STANDARD_DAMAGE_TYPES.includes(this.props.base as StandardDamageType);
  }

  static create(dado: string, base: string, espiritual: boolean): DamageDescriptor {
    if (!dado || !DADO_REGEX.test(dado.trim())) {
      throw new DomainValidationError(
        'Notação de dado inválida. Use o formato NdN (ex: 1d8)',
        'dado',
      );
    }

    if (!base || base.trim().length === 0) {
      throw new DomainValidationError('Tipo de dano não pode ser vazio', 'base');
    }

    return new DamageDescriptor({
      dado: dado.trim().toLowerCase(),
      base: base.trim().toLowerCase(),
      espiritual,
    });
  }
}
