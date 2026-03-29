import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface NarrativeProfileProps {
  identity: string;
  origin: string;
  motivations: string[];
  complications: string[];
}

export class NarrativeProfile {
  private readonly props: NarrativeProfileProps;

  private constructor(props: NarrativeProfileProps) {
    this.props = props;
  }

  static create(props: NarrativeProfileProps): NarrativeProfile {
    const totalEntries = props.motivations.length + props.complications.length;

    if (totalEntries < 2) {
      throw new DomainValidationError(
        'O personagem deve ter pelo menos duas entradas combinando motivações e complicações.',
        'narrative',
      );
    }

    return new NarrativeProfile(props);
  }

  get identity(): string {
    return this.props.identity;
  }

  get origin(): string {
    return this.props.origin;
  }

  get motivations(): string[] {
    return [...this.props.motivations];
  }

  get complications(): string[] {
    return [...this.props.complications];
  }
}
