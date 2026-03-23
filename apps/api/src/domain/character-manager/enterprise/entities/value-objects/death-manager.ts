import { DomainValidationError } from '@/core/errors/domain-validation-error';

export type DeathState = 'ALIVE' | 'DYING' | 'DEAD';

export interface DeathManagerProps {
  state: DeathState;
  deathCounter: number;
}

export class DeathManager {
  private readonly props: DeathManagerProps;

  private constructor(props: DeathManagerProps) {
    this.props = props;
  }

  static create(props?: Partial<DeathManagerProps>): DeathManager {
    return new DeathManager({
      state: props?.state ?? 'ALIVE',
      deathCounter: props?.deathCounter ?? 0,
    });
  }

  get state(): DeathState {
    return this.props.state;
  }

  get deathCounter(): number {
    return this.props.deathCounter;
  }

  fallUnconscious(): DeathManager {
    if (this.props.state === 'DEAD') {
      return this;
    }
    return new DeathManager({
      state: 'DYING',
      deathCounter: 0,
    });
  }

  stabilize(): DeathManager {
    if (this.props.state === 'DEAD') {
      return this;
    }
    return new DeathManager({
      state: 'ALIVE',
      deathCounter: 0,
    });
  }

  tickDeathCounter(): { manager: DeathManager; justDied: boolean } {
    if (this.props.state !== 'DYING') {
      return { manager: this, justDied: false };
    }

    const nextCounter = this.props.deathCounter + 1;

    if (nextCounter >= 3) {
      const newManager = new DeathManager({
        state: 'DEAD',
        deathCounter: nextCounter,
      });
      return { manager: newManager, justDied: true };
    }

    const newManager = new DeathManager({
      state: 'DYING',
      deathCounter: nextCounter,
    });
    return { manager: newManager, justDied: false };
  }
}
