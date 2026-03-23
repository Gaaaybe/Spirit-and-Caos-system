import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface HealthManagerProps {
  level: number;
  constitutionModifier: number;
  currentPV?: number;
  temporaryPV?: number;
}

export class HealthManager {
  private readonly props: HealthManagerProps;

  private constructor(props: HealthManagerProps) {
    this.props = {
      level: props.level,
      constitutionModifier: props.constitutionModifier,
      currentPV: props.currentPV,
      temporaryPV: props.temporaryPV ?? 0,
    };
  }

  static create(props: HealthManagerProps): HealthManager {
    if (props.level < 1)
      throw new DomainValidationError('Nível não pode ser menor que 1.', 'level');

    const manager = new HealthManager(props);
    if (manager.props.currentPV === undefined) {
      manager.props.currentPV = manager.maxPV;
    }
    return manager;
  }

  get maxPV(): number {
    const calculated = this.props.level * this.props.constitutionModifier + 6;
    return Math.max(4, calculated);
  }

  get currentPV(): number {
    return this.props.currentPV!;
  }

  get temporaryPV(): number {
    return this.props.temporaryPV!;
  }

  updateLevel(newLevel: number): HealthManager {
    if (newLevel < 1) throw new DomainValidationError('Nível não pode ser menor que 1.', 'level');

    const newManager = new HealthManager({
      ...this.props,
      level: newLevel,
    });

    return newManager;
  }

  takeDamage(amount: number): HealthManager {
    if (amount < 0) throw new DomainValidationError('O dano não pode ser negativo.', 'damage');

    let remainingDamage = amount;
    let newTemp = this.temporaryPV;
    let newCurrent = this.currentPV;

    if (newTemp > 0) {
      if (newTemp >= remainingDamage) {
        newTemp -= remainingDamage;
        remainingDamage = 0;
      } else {
        remainingDamage -= newTemp;
        newTemp = 0;
      }
    }

    if (remainingDamage > 0) {
      newCurrent = Math.max(0, newCurrent - remainingDamage);
    }

    return new HealthManager({
      ...this.props,
      currentPV: newCurrent,
      temporaryPV: newTemp,
    });
  }

  heal(amount: number): HealthManager {
    if (amount < 0) throw new DomainValidationError('A cura não pode ser negativa.', 'heal');

    return new HealthManager({
      ...this.props,
      currentPV: Math.min(this.maxPV, this.currentPV + amount),
    });
  }

  addTemporaryPV(amount: number): HealthManager {
    if (amount < 0)
      throw new DomainValidationError('PV temporário não pode ser negativo.', 'temporaryPV');

    return new HealthManager({
      ...this.props,
      temporaryPV: Math.max(this.temporaryPV, amount),
    });
  }
}
