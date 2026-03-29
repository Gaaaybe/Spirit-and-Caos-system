export interface CombatStatsProps {
  dodge: number;
  baseDamageReduction: number;
  blockDamageReduction: number;
}

export class CombatStats {
  private readonly props: CombatStatsProps;

  private constructor(props: CombatStatsProps) {
    this.props = props;
  }

  static create(props: CombatStatsProps): CombatStats {
    return new CombatStats(props);
  }

  get dodge(): number {
    return this.props.dodge;
  }

  get baseRD(): number {
    return this.props.baseDamageReduction;
  }

  get blockRD(): number {
    return this.props.blockDamageReduction;
  }
}
