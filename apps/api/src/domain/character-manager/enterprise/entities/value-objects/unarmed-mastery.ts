export interface UnarmedMasteryProps {
  customName?: string;
  degree: number; // 0 to 9
  marginImprovements: number; // Max 2 per degree
  multiplierImprovements: number;
  damageType: string;
}

export class UnarmedMastery {
  private readonly props: UnarmedMasteryProps;

  private constructor(props: UnarmedMasteryProps) {
    this.props = props;
  }

  static createDefault(): UnarmedMastery {
    return new UnarmedMastery({
      degree: 0,
      marginImprovements: 0,
      multiplierImprovements: 0,
      damageType: 'Impacto',
    });
  }

  static create(props: UnarmedMasteryProps): UnarmedMastery {
    return new UnarmedMastery(props);
  }

  get degree(): number {
    return this.props.degree;
  }

  get customName(): string | undefined {
    return this.props.customName;
  }

  get marginImprovements(): number {
    return this.props.marginImprovements;
  }

  get multiplierImprovements(): number {
    return this.props.multiplierImprovements;
  }

  get damageType(): string {
    return this.props.damageType;
  }

  /**
   * Cálculo do dado de dano: 1d(2^(degree + 1))
   * Grau 0: 1d2
   * Grau 1: 1d4
   * Grau 2: 1d8
   * ...
   * Grau 9: 1d1024
   */
  get damageDie(): string {
    const dieValue = Math.pow(2, this.degree + 1);
    return `1d${dieValue}`;
  }

  get criticalMargin(): number {
    // Cada melhoria reduz a margem em exatamente -1.
    const reduction = this.marginImprovements;
    const margin = 20 - reduction;
    return Math.max(10, margin);
  }

  get criticalMultiplier(): number {
    // Cada melhoria aumenta o multiplicador em exatamente +1.
    const bonus = this.multiplierImprovements;
    return 2 + bonus;
  }

  /**
   * Custo total de PdA gasto nesta maestria
   */
  get totalPdaCost(): number {
    let cost = 0;

    // Grau: 7 PdA cada
    cost += this.degree * 7;

    // Aprimoramentos custam 1 PdA * Grau cada (se houver grau)
    const improvementUnitCost = this.degree > 0 ? this.degree : 1;
    
    // Margem: Custo Escalonado
    cost += this.marginImprovements * improvementUnitCost;

    // Multiplicador: Custo Escalonado
    cost += this.multiplierImprovements * improvementUnitCost;

    // Tipo de Dano: +1 PdA se não for Impacto (Fixo)
    if (this.damageType.toLowerCase() !== 'impacto' && this.damageType !== '') {
      cost += 1;
    }

    return cost;
  }

  /**
   * Valida se uma nova configuração é válida segundo as regras
   */
  static validate(props: UnarmedMasteryProps): string | null {
    if (props.degree < 0 || props.degree > 9) {
      return 'O grau deve estar entre 0 e 9.';
    }

    // Regra: Limite de 2 melhorias de margem por grau
    if (props.marginImprovements > props.degree * 2) {
      return `Com Grau ${props.degree}, você só pode ter até ${props.degree * 2} melhorias de margem de crítico.`;
    }

    // Regra: Margem absoluta travada em 10 (20-10)
    if (props.marginImprovements > 10) {
      return 'A margem de crítico não pode ser menor que 10.';
    }

    // Regra: Multiplicador só a partir do Grau 3, 1x a cada 2 graus
    if (props.multiplierImprovements > 0) {
      if (props.degree < 3) {
        return 'Melhorias de multiplicador exigem pelo menos Grau 3.';
      }
      
      // Grau 3-4: max 1 (x3)
      // Grau 5-6: max 2 (x4)
      // Grau 7-8: max 3 (x5)
      // Grau 9: max 3 (teto x5)
      const maxMultiplierImprovements = Math.min(3, Math.floor((props.degree - 1) / 2));
      if (props.multiplierImprovements > maxMultiplierImprovements) {
        const allowed = 2 + maxMultiplierImprovements;
        return `Com Grau ${props.degree}, o multiplicador máximo permitido é x${allowed}.`;
      }
    }

    return null;
  }

  toValue(): UnarmedMasteryProps {
    return { ...this.props };
  }
}
