import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Character } from '../entities/character';
import { CharacterPower } from '../entities/character-power';

export interface AcquirePowerInput {
  character: Character;
  powerId: string;
  domainId: string;
  slotCost: number;
  calculatedFinalCost: number;
}

export interface AcquirePowerResult {
  globalModificationIdToInject: string | null;
}

@Injectable()
export class AcquirePowerService {
  execute({
    character,
    powerId,
    domainId,
    slotCost,
    calculatedFinalCost,
  }: AcquirePowerInput): Either<DomainValidationError, AcquirePowerResult> {
    const alreadyHasPower = character.powers.getItems().some((p) => p.powerId === powerId);

    if (alreadyHasPower) {
      return left(new DomainValidationError('O personagem já possui este poder.', 'powerId'));
    }

    const mastery = character.domainMasteries.find((m) => m.domainId === domainId);
    const globalModificationIdToInject = mastery ? mastery.modificationIdToInject : null;

    try {
      character.spendPda(calculatedFinalCost);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        return left(error);
      }
      throw error;
    }

    const characterPower = CharacterPower.create({
      powerId,
      isEquipped: false,
      finalPdaCost: calculatedFinalCost,
      slotCost,
    });

    character.powers.add(characterPower);

    return right({ globalModificationIdToInject });
  }
}
