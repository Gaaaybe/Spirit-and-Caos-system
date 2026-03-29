export type ConditionName =
  | 'Abalado'
  | 'Caído'
  | 'Faminto'
  | 'Fraco'
  | 'Frustrado'
  | 'Lento'
  | 'Ofuscado'
  | 'Privado'
  | 'Surdo'
  | 'Alquebrado'
  | 'Debilitado'
  | 'Desprevenido'
  | 'Enjoado'
  | 'Entorpecido'
  | 'Esmorecido'
  | 'Fascinado'
  | 'Imóvel'
  | 'Pasmo'
  | 'Agarrado'
  | 'Apavorado'
  | 'Atordoado'
  | 'Cego'
  | 'Confuso'
  | 'Fatigado'
  | 'Surpreendido'
  | 'Vulnerável'
  | 'Enredado'
  | 'Exausto'
  | 'Inconsciente'
  | 'Indefeso'
  | 'Paralisado'
  | 'Lesão';

export type ConditionTier = 1 | 2 | 3 | 4;

export const CONDITION_TIERS: Record<ConditionName, ConditionTier> = {
  Abalado: 1,
  Caído: 1,
  Faminto: 1,
  Fraco: 1,
  Frustrado: 1,
  Lento: 1,
  Ofuscado: 1,
  Privado: 1,
  Surdo: 1,
  Lesão: 1,

  Alquebrado: 2,
  Debilitado: 2,
  Desprevenido: 2,
  Enjoado: 2,
  Entorpecido: 2,
  Esmorecido: 2,
  Fascinado: 2,
  Imóvel: 2,
  Pasmo: 2,

  Agarrado: 3,
  Apavorado: 3,
  Atordoado: 3,
  Cego: 3,
  Confuso: 3,
  Fatigado: 3,
  Surpreendido: 3,
  Vulnerável: 3,

  Enredado: 4,
  Exausto: 4,
  Inconsciente: 4,
  Indefeso: 4,
  Paralisado: 4,
};

const CONDITION_EVOLUTION_MAP: Partial<Record<ConditionName, ConditionName>> = {
  Abalado: 'Apavorado',
  Fraco: 'Debilitado',
  Debilitado: 'Inconsciente',
  Frustrado: 'Esmorecido',
  Fatigado: 'Exausto',
  Exausto: 'Inconsciente',
};

const COMPOSITE_CONDITIONS: Partial<Record<ConditionName, ConditionName[]>> = {
  Fatigado: ['Fraco', 'Vulnerável'],
  Exausto: ['Debilitado', 'Lento', 'Vulnerável'],
  Agarrado: ['Desprevenido', 'Imóvel'],
  Atordoado: ['Desprevenido'],
  Cego: ['Desprevenido', 'Lento'],
  Surpreendido: ['Desprevenido'],
  Inconsciente: ['Indefeso'],
  Indefeso: ['Desprevenido'],
  Paralisado: ['Imóvel', 'Indefeso'],
};

export interface ConditionManagerProps {
  activeConditions: Set<ConditionName>;
}

export class ConditionManager {
  private readonly props: ConditionManagerProps;

  private constructor(props: ConditionManagerProps) {
    this.props = props;
  }

  static create(activeConditions?: ConditionName[]): ConditionManager {
    return new ConditionManager({
      activeConditions: new Set(activeConditions || []),
    });
  }

  get activeConditions(): ConditionName[] {
    return Array.from(this.props.activeConditions);
  }

  get highestActiveTier(): number {
    let highest = 0;
    for (const condition of this.props.activeConditions) {
      const tier = CONDITION_TIERS[condition];
      if (tier > highest) {
        highest = tier;
      }
    }
    return highest;
  }

  hasEffectOf(condition: ConditionName): boolean {
    if (this.props.activeConditions.has(condition)) return true;

    for (const active of this.props.activeConditions) {
      const inherited = COMPOSITE_CONDITIONS[active];
      if (inherited && inherited.includes(condition)) {
        return true;
      }
    }
    return false;
  }

  add(condition: ConditionName): ConditionManager {
    const newSet = new Set(this.props.activeConditions);

    if (newSet.has(condition)) {
      const evolution = CONDITION_EVOLUTION_MAP[condition];
      if (evolution) {
        newSet.delete(condition);
        newSet.add(evolution);
      }
    } else {
      newSet.add(condition);
    }

    return new ConditionManager({ activeConditions: newSet });
  }

  remove(condition: ConditionName): ConditionManager {
    const newSet = new Set(this.props.activeConditions);
    newSet.delete(condition);
    return new ConditionManager({ activeConditions: newSet });
  }

  get blocksEnergyRecovery(): boolean {
    return this.hasEffectOf('Faminto');
  }

  get incomingDamageMultiplier(): number {
    return this.hasEffectOf('Vulnerável') ? 2 : 1;
  }

  get skillCostMultiplier(): number {
    return this.hasEffectOf('Alquebrado') ? 2 : 1;
  }

  get physicalDisadvantageCount(): number {
    if (this.hasEffectOf('Debilitado')) return 2;
    if (this.hasEffectOf('Fraco')) return 1;
    return 0;
  }

  get mentalDisadvantageCount(): number {
    if (this.hasEffectOf('Esmorecido')) return 2;
    if (this.hasEffectOf('Frustrado')) return 1;
    return 0;
  }

  get generalDisadvantageCount(): number {
    if (this.hasEffectOf('Apavorado')) return 3;
    if (this.hasEffectOf('Abalado')) return 1;
    return 0;
  }

  get attackDisadvantageCount(): number {
    let count = 0;
    if (this.hasEffectOf('Caído')) count += 2;
    if (this.hasEffectOf('Ofuscado')) count += 1;
    if (this.hasEffectOf('Enredado')) count += 1;
    if (this.hasEffectOf('Agarrado')) count += 1;
    return count;
  }

  get perceptionDisadvantageCount(): number {
    let count = 0;
    if (this.hasEffectOf('Fascinado')) count += 2;
    if (this.hasEffectOf('Ofuscado')) count += 1;
    return count;
  }

  get halvesDefenses(): boolean {
    return this.hasEffectOf('Desprevenido');
  }

  get failsReflexAndFortitude(): boolean {
    return this.hasEffectOf('Indefeso');
  }
}
