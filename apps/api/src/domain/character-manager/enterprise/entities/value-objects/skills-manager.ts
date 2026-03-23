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
  | 'Ofício'
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
      'Ofício',
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

  calculateRollBonus(name: SkillName, attributeModifier: number, efficiencyBonus: number): number {
    const skill = this.getSkill(name);
    let finalBonus = attributeModifier + skill.trainingBonus;

    if (skill.proficiencyState === 'EFFICIENT') {
      finalBonus += efficiencyBonus;
    } else if (skill.proficiencyState === 'INEFFICIENT') {
      finalBonus -= Math.round(efficiencyBonus / 2);
    }

    return finalBonus;
  }
}
