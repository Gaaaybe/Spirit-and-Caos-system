import { Entity } from '@/core/entities/entity';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

export interface CharacterPowerArrayProps {
  powerArrayId: string;
  isEquipped: boolean;
  finalPdaCost: number;
  slotCost: number;
}

export class CharacterPowerArray extends Entity<CharacterPowerArrayProps> {
  static create(props: CharacterPowerArrayProps, id?: UniqueEntityId): CharacterPowerArray {
    if (props.finalPdaCost < 0) {
      throw new DomainValidationError(
        'O custo final de PdA do acervo não pode ser negativo.',
        'finalPdaCost',
      );
    }
    if (props.slotCost < 0) {
      throw new DomainValidationError(
        'O custo em espaços do acervo não pode ser negativo.',
        'slotCost',
      );
    }

    return new CharacterPowerArray(props, id);
  }

  get powerArrayId(): string {
    return this.props.powerArrayId;
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
