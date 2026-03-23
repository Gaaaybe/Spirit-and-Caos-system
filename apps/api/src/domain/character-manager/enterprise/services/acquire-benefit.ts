import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import type { Character } from '../entities/character';
import { CharacterBenefit } from '../entities/character-benefit';
import { CalculateBenefitCostService, type BenefitCatalogEntry } from './calculate-benefit-cost';

export interface AcquireBenefitInput {
  character: Character;
  benefitCatalogEntry: BenefitCatalogEntry;
  targetDegree: number;
}

export interface AcquireBenefitResult {
  benefit: CharacterBenefit;
  costPaid: number;
}

@Injectable()
export class AcquireBenefitService {
  constructor(private calculateCostService: CalculateBenefitCostService) {}

  execute({
    character,
    benefitCatalogEntry,
    targetDegree,
  }: AcquireBenefitInput): Either<DomainValidationError, AcquireBenefitResult> {
    const currentBenefit = character.benefits
      .getItems()
      .find((b) => b.name === benefitCatalogEntry.nome);
    
    const currentDegree = currentBenefit ? currentBenefit.degree : 0;

    if (targetDegree <= currentDegree) {
      return left(
        new DomainValidationError(
          'O novo grau deve ser maior que o grau atual do benefício.',
          'targetDegree'
        )
      );
    }

    if (
      typeof benefitCatalogEntry.graus === 'number' &&
      targetDegree > benefitCatalogEntry.graus
    ) {
      return left(
        new DomainValidationError(
          `O grau máximo para este benefício é ${benefitCatalogEntry.graus}.`,
          'targetDegree'
        )
      );
    }

    const costToPay = this.calculateCostService.execute(
      benefitCatalogEntry,
      targetDegree,
      currentDegree
    );

    try {
      character.spendPda(costToPay);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        return left(error);
      }
      throw error;
    }

    let updatedBenefit: CharacterBenefit;

    if (currentBenefit) {
      character.benefits.remove(currentBenefit);
      updatedBenefit = CharacterBenefit.create({
        name: benefitCatalogEntry.nome,
        degree: targetDegree,
        pdaCost: currentBenefit.pdaCost + costToPay,
      });
    } else {
      updatedBenefit = CharacterBenefit.create({
        name: benefitCatalogEntry.nome,
        degree: targetDegree,
        pdaCost: costToPay,
      });
    }

    character.benefits.add(updatedBenefit);

    return right({
      benefit: updatedBenefit,
      costPaid: costToPay,
    });
  }
}
