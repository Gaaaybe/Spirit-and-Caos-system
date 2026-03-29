export type SpiritualStage = 'NORMAL' | 'DIVINE';

export interface SpiritualPrincipleProps {
  isUnlocked: boolean;
  stage: SpiritualStage;
}

export class SpiritualPrinciple {
  private readonly props: SpiritualPrincipleProps;

  private constructor(props: SpiritualPrincipleProps) {
    this.props = props;
  }

  static create(props: SpiritualPrincipleProps): SpiritualPrinciple {
    return new SpiritualPrinciple(props);
  }

  get isUnlocked(): boolean {
    return this.props.isUnlocked;
  }

  get stage(): SpiritualStage {
    return this.props.stage;
  }

  get bonusPdaOnCreation(): number {
    return this.isUnlocked ? 0 : 15;
  }

  get canUseLiberation(): boolean {
    return this.stage === 'DIVINE';
  }

  get canUseTransformation(): boolean {
    return this.stage === 'DIVINE';
  }

  get canUseSuppression(): boolean {
    return this.stage === 'DIVINE';
  }

  get canUseForesee(): boolean {
    return this.stage === 'DIVINE';
  }
}
