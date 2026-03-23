import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface CharacterPowerProps {
  powerId: string;
  isEquipped: boolean;
  finalPdaCost: number;
  slotCost: number;
}

export class CharacterPower extends Entity<CharacterPowerProps> {
  static create(props: CharacterPowerProps, id?: UniqueEntityId): CharacterPower {
    if (props.finalPdaCost < 0) {
      throw new DomainValidationError(
        'O custo final de PdA não pode ser negativo.',
        'finalPdaCost',
      );
    }
    if (props.slotCost < 0) {
      throw new DomainValidationError('O custo em espaços não pode ser negativo.', 'slotCost');
    }

    return new CharacterPower(props, id);
  }

  get powerId(): string {
    return this.props.powerId;
  }

  get isEquipped(): boolean {
    return this.props.isEquipped;
  }

  get finalPdaCost(): number {
    return this.props.finalPdaCost;
  }

  get slotCost(): number {
    return this.props.slotCost;
  }

  equip(): void {
    this.props.isEquipped = true;
  }

  unequip(): void {
    this.props.isEquipped = false;
  }
}
