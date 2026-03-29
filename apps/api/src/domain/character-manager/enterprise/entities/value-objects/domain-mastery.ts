export type MasteryLevel = 'INICIANTE' | 'PRATICANTE' | 'MESTRE';

export interface DomainMasteryProps {
  domainId: string;
  masteryLevel: MasteryLevel;
}

export class DomainMastery {
  private readonly props: DomainMasteryProps;

  private constructor(props: DomainMasteryProps) {
    this.props = props;
  }

  static create(props: DomainMasteryProps): DomainMastery {
    return new DomainMastery(props);
  }

  get domainId(): string {
    return this.props.domainId;
  }

  get masteryLevel(): MasteryLevel {
    return this.props.masteryLevel;
  }

  get modificationIdToInject(): string | null {
    if (this.masteryLevel === 'INICIANTE') return 'dominio-iniciante';
    if (this.masteryLevel === 'MESTRE') return 'dominio-mestre';
    return null;
  }
}
