import { DomainValidationError } from '@/core/errors/domain-validation-error';

export class UpgradeLevel {
  private readonly _value: number;
  private readonly _maxLevel: number;

  private constructor(value: number, maxLevel: number) {
    this._value = value;
    this._maxLevel = maxLevel;
  }

  get value(): number {
    return this._value;
  }

  get maxLevel(): number {
    return this._maxLevel;
  }

  isMaxed(): boolean {
    return this._value >= this._maxLevel;
  }

  getMultiplier(): number {
    return Math.pow(2, this._value);
  }

  increment(): UpgradeLevel {
    if (this.isMaxed()) {
      throw new DomainValidationError(
        `Nível de aprimoramento já está no máximo (${this._maxLevel})`,
        'upgradeLevel',
      );
    }

    return new UpgradeLevel(this._value + 1, this._maxLevel);
  }

  static create(value: number, maxLevel: number): UpgradeLevel {
    if (value < 0 || value > maxLevel) {
      throw new DomainValidationError(
        `Nível de aprimoramento deve estar entre 0 e ${maxLevel}`,
        'upgradeLevel',
      );
    }

    return new UpgradeLevel(value, maxLevel);
  }
}
