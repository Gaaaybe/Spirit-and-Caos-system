import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Character } from '../entities/character';
import { CharacterPowerArray } from '../entities/character-power-array';

export interface AcquirePowerArrayInput {
  character: Character;
  powerArrayId: string;
  domainId: string;
  slotCost: number;
  calculatedFinalCost: number;
}

export interface AcquirePowerArrayResult {
  globalModificationIdToInject: string | null;
}

@Injectable()
export class AcquirePowerArrayService {
  execute({
    character,
    powerArrayId,
    domainId,
    slotCost,
    calculatedFinalCost,
  }: AcquirePowerArrayInput): Either<DomainValidationError, AcquirePowerArrayResult> {
    const alreadyHasArray = character.powerArrays.getItems().some((a) => a.powerArrayId === powerArrayId);

    if (alreadyHasArray) {
      return left(new DomainValidationError('O personagem já possui este acervo.', 'powerArrayId'));
    }

    const mastery = character.domainMasteries.find((m) => m.domainId === domainId);
    
    if (!mastery) {
      return left(new DomainValidationError('O personagem não possui a maestria no domínio necessário para este acervo.', 'domainId'));
    }

    const globalModificationIdToInject = mastery ? mastery.modificationIdToInject : null;

    try {
      character.spendPda(calculatedFinalCost);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        return left(error);
      }
      throw error;
    }

    const characterPowerArray = CharacterPowerArray.create({
      powerArrayId,
      isEquipped: false,
      finalPdaCost: calculatedFinalCost,
      slotCost,
    });

    character.powerArrays.add(characterPowerArray);

    return right({ globalModificationIdToInject });
  }
}
