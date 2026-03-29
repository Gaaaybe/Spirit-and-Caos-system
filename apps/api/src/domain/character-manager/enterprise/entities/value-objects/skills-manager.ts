export type ProficiencyState = 'EFFICIENT' | 'NEUTRAL' | 'INEFFICIENT';

export type SkillName =
  | 'Acrobacia'
  | 'Atletismo'
  | 'Cavalgar'
  | 'Furtividade'
  | 'Iniciativa'
  | 'Ladinagem'
  | 'Conhecimento'
  | 'Espiritismo'
  | 'Exploração'
  | 'Investigação'
  | 'Pilotar'
  | 'Religião'
  | 'Adestrar Animais'
  | 'Atuação'
  | 'Diplomacia'
  | 'Enganação'
  | 'Intimidação'
  | 'Cura'
  | 'Intuição'
  | 'Percepção'
  | 'Sobrevivência'
  | 'Fortitude'
  | 'Reflexos'
  | 'Vontade';

export interface SkillEntry {
  proficiencyState: ProficiencyState;
  trainingBonus: number;
  extraBonus: number;
}

export interface SkillsManagerProps {
  entries: Map<SkillName, SkillEntry>;
}

export class SkillsManager {
  private readonly props: SkillsManagerProps;

  private constructor(props: SkillsManagerProps) {
    this.props = props;
  }

  static createInitial(): SkillsManager {
    const entries = new Map<SkillName, SkillEntry>();
    const allSkills: SkillName[] = [
      'Acrobacia',
      'Atletismo',
      'Cavalgar',
      'Furtividade',
      'Iniciativa',
      'Ladinagem',
      'Conhecimento',
      'Espiritismo',
      'Exploração',
      'Investigação',
      'Pilotar',
      'Religião',
      'Adestrar Animais',
      'Atuação',
      'Diplomacia',
      'Enganação',
      'Intimidação',
      'Cura',
      'Intuição',
      'Percepção',
      'Sobrevivência',
      'Fortitude',
      'Reflexos',
      'Vontade',
    ];

    for (const skillName of allSkills) {
      entries.set(skillName, {
        proficiencyState: 'NEUTRAL',
        trainingBonus: 0,
        extraBonus: 0,
      });
    }

    return new SkillsManager({ entries });
  }

  static create(props: SkillsManagerProps): SkillsManager {
    return new SkillsManager(props);
  }

  get entries(): Map<SkillName, SkillEntry> {
    return new Map(this.props.entries);
  }

  getSkill(name: SkillName): SkillEntry {
    const skill = this.props.entries.get(name);
    if (!skill) {
      throw new Error(`Perícia não encontrada: ${name}`);
    }
    return { ...skill };
  }

  setSkill(name: SkillName, state: ProficiencyState, trainingBonus: number, extraBonus: number): SkillsManager {
    const newEntries = new Map(this.props.entries);
    newEntries.set(name, {
      proficiencyState: state,
      trainingBonus: Math.max(0, trainingBonus),
      extraBonus,
    });
    return new SkillsManager({ entries: newEntries });
  }

  trainSkill(name: SkillName, bonus: number): SkillsManager {
    if (bonus <= 0) return this;

    const newEntries = new Map(this.props.entries);
    const skill = this.getSkill(name);
    newEntries.set(name, { ...skill, trainingBonus: skill.trainingBonus + bonus });

    return new SkillsManager({ entries: newEntries });
  }

  setProficiency(name: SkillName, state: ProficiencyState): SkillsManager {
    const newEntries = new Map(this.props.entries);
    const skill = this.getSkill(name);
    newEntries.set(name, { ...skill, proficiencyState: state });

    return new SkillsManager({ entries: newEntries });
  }

  calculateRollBonus(name: SkillName, attributeModifier: number, efficiencyBonus: number, includeExtraBonus = true): number {
    const skill = this.getSkill(name);
    let finalBonus = attributeModifier + (skill.trainingBonus || 0);

    if (includeExtraBonus) {
      finalBonus += (skill.extraBonus || 0);
    }

    if (skill.proficiencyState === 'EFFICIENT') {
      finalBonus += efficiencyBonus;
    } else if (skill.proficiencyState === 'INEFFICIENT') {
      finalBonus -= Math.round(efficiencyBonus / 2);
    }

    return finalBonus;
  }
}
