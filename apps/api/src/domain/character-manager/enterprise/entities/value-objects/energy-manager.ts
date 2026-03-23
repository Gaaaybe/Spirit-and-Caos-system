import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface EnergyManagerProps {
  keyPhysicalModifier: number;
  keyMentalModifier: number;
  currentPE?: number;
  temporaryPE?: number;
}

export class EnergyManager {
  private readonly props: EnergyManagerProps;

  private constructor(props: EnergyManagerProps) {
    this.props = {
      keyPhysicalModifier: props.keyPhysicalModifier,
      keyMentalModifier: props.keyMentalModifier,
      currentPE: props.currentPE,
      temporaryPE: props.temporaryPE ?? 0,
    };
  }

  static create(props: EnergyManagerProps): EnergyManager {
    const manager = new EnergyManager(props);
    if (manager.props.currentPE === undefined) {
      manager.props.currentPE = manager.maxPE;
    }
    return manager;
  }

  get maxPE(): number {
    const sumMod = this.props.keyPhysicalModifier + this.props.keyMentalModifier;
    const peCalculado = Math.floor(899 * Math.sqrt(Math.max(0, sumMod) / 15000));
    return Math.max(4, peCalculado);
  }

  get currentPE(): number {
    return this.props.currentPE!;
  }

  get temporaryPE(): number {
    return this.props.temporaryPE!;
  }

  consume(amount: number): EnergyManager {
    if (amount < 0)
      throw new DomainValidationError('A quantidade a consumir não pode ser negativa.', 'consume');

    let remainingAmount = amount;
    let newTemp = this.temporaryPE;
    let newCurrent = this.currentPE;

    if (newTemp > 0) {
      if (newTemp >= remainingAmount) {
        newTemp -= remainingAmount;
        remainingAmount = 0;
      } else {
        remainingAmount -= newTemp;
        newTemp = 0;
      }
    }

    if (remainingAmount > 0) {
      if (newCurrent < remainingAmount) {
        throw new DomainValidationError(
          `PE insuficiente. Necessário: ${amount}, Disponível: ${newCurrent + this.temporaryPE}`,
          'currentPE',
        );
      }
      newCurrent -= remainingAmount;
    }

    return new EnergyManager({
      ...this.props,
      currentPE: newCurrent,
      temporaryPE: newTemp,
    });
  }

  recover(amount: number): EnergyManager {
    if (amount < 0)
      throw new DomainValidationError('A recuperação não pode ser negativa.', 'recover');

    return new EnergyManager({
      ...this.props,
      currentPE: Math.min(this.maxPE, this.currentPE + amount),
    });
  }
}
