import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface SlotManagerProps {
  intelligenceModifier: number;
  usedSlots?: number;
}

export class SlotManager {
  private readonly props: SlotManagerProps;

  private constructor(props: SlotManagerProps) {
    this.props = {
      intelligenceModifier: props.intelligenceModifier,
      usedSlots: props.usedSlots ?? 0,
    };
  }

  static create(props: SlotManagerProps): SlotManager {
    return new SlotManager(props);
  }

  get maxSlots(): number {
    const effectiveMod = Math.max(0, this.props.intelligenceModifier);
    const espacosCalculados = Math.floor(899 * Math.sqrt(effectiveMod / 15000));
    return Math.max(4, espacosCalculados);
  }

  get usedSlots(): number {
    return this.props.usedSlots!;
  }

  get availableSlots(): number {
    return this.maxSlots - this.usedSlots;
  }

  use(amount: number): SlotManager {
    if (amount < 0)
      throw new DomainValidationError(
        'A quantidade de espaços a usar não pode ser negativa.',
        'usedSlots',
      );

    if (this.availableSlots < amount) {
      throw new DomainValidationError(
        `Espaços insuficientes. Necessário: ${amount}, Disponível: ${this.availableSlots}`,
        'usedSlots',
      );
    }

    return new SlotManager({
      ...this.props,
      usedSlots: this.props.usedSlots! + amount,
    });
  }

  free(amount: number): SlotManager {
    if (amount < 0)
      throw new DomainValidationError(
        'A quantidade de espaços a liberar não pode ser negativa.',
        'usedSlots',
      );

    return new SlotManager({
      ...this.props,
      usedSlots: Math.max(0, this.props.usedSlots! - amount),
    });
  }
}
