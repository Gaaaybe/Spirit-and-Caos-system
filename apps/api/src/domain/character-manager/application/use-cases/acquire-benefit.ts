import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { BenefitsLookupPort } from '../repositories/benefits-lookup-port';
import { AcquireBenefitService } from '../../enterprise/services/acquire-benefit';
import { Character } from '../../enterprise/entities/character';

interface AcquireBenefitUseCaseRequest {
  characterId: string;
  userId: string;
  benefitName: string;
  targetDegree: number;
}

type AcquireBenefitUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
    costPaid: number;
  }
>;

@Injectable()
export class AcquireBenefitUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private benefitsLookupPort: BenefitsLookupPort,
    private acquireBenefitService: AcquireBenefitService,
  ) {}

  async execute({
    characterId,
    userId,
    benefitName,
    targetDegree,
  }: AcquireBenefitUseCaseRequest): Promise<AcquireBenefitUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const benefitInfo = await this.benefitsLookupPort.findByName(benefitName);

    if (!benefitInfo) {
      return left(new ResourceNotFoundError());
    }

    const result = this.acquireBenefitService.execute({
      character,
      benefitCatalogEntry: benefitInfo,
      targetDegree,
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    await this.charactersRepository.save(character);

    return right({
      character,
      costPaid: result.value.costPaid,
    });
  }
}
