import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface PdAManagerProps {
  level: number;
  extraPda?: number;
  spentPda?: number;
}

export class PdAManager {
  private readonly props: PdAManagerProps;

  private constructor(props: PdAManagerProps) {
    this.props = {
      level: props.level,
      extraPda: props.extraPda ?? 0,
      spentPda: props.spentPda ?? 0,
    };
  }

  static create(props: PdAManagerProps): PdAManager {
    if (props.level < 1)
      throw new DomainValidationError('Nível não pode ser menor que 1.', 'level');
    return new PdAManager(props);
  }

  get totalPda(): number {
    const base = 15;
    const porNivel = (this.props.level - 1) * 7;
    const bonus = Math.floor(this.props.level / 5) * 7;
    return base + porNivel + bonus + this.props.extraPda!;
  }

  get spentPda(): number {
    return this.props.spentPda!;
  }

  get extraPda(): number {
    return this.props.extraPda!;
  }

  get availablePda(): number {
    return this.totalPda - this.spentPda;
  }

  updateLevel(newLevel: number): PdAManager {
    if (newLevel < 1) throw new DomainValidationError('Nível não pode ser menor que 1.', 'level');
    return new PdAManager({
      ...this.props,
      level: newLevel,
    });
  }

  spend(amount: number): PdAManager {
    if (amount < 0)
      throw new DomainValidationError('A quantidade a gastar não pode ser negativa.', 'spentPda');
    if (this.availablePda < amount) {
      throw new DomainValidationError(
        `PdA insuficiente. Necessário: ${amount}, Disponível: ${this.availablePda}`,
        'spentPda',
      );
    }
    return new PdAManager({
      ...this.props,
      spentPda: this.props.spentPda! + amount,
    });
  }

  refund(amount: number): PdAManager {
    if (amount < 0)
      throw new DomainValidationError(
        'A quantidade a reembolsar não pode ser negativa.',
        'spentPda',
      );
    return new PdAManager({
      ...this.props,
      spentPda: Math.max(0, this.props.spentPda! - amount),
    });
  }
}
