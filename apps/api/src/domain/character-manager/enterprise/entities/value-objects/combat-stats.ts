export interface CombatStatsProps {
  baseDodge: number;
  baseDamageReduction: number;
  suitDamageReduction: number;
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
    return this.props.baseDodge;
  }

  get damageReduction(): number {
    return this.props.baseDamageReduction + this.props.suitDamageReduction;
  }
}
