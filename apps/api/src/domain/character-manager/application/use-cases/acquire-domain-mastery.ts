import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { MasteryLevel } from '../../enterprise/entities/value-objects/domain-mastery';
import { DomainsLookupPort } from '../repositories/domains-lookup-port';

interface AcquireDomainMasteryUseCaseRequest {
  characterId: string;
  userId: string;
  domainId: string;
  masteryLevel: MasteryLevel;
}

type AcquireDomainMasteryUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class AcquireDomainMasteryUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private domainsLookupPort: DomainsLookupPort,
  ) {}

  async execute({
    characterId,
    userId,
    domainId,
    masteryLevel,
  }: AcquireDomainMasteryUseCaseRequest): Promise<AcquireDomainMasteryUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const domain = await this.domainsLookupPort.findById(domainId);

    if (!domain) {
      return left(new ResourceNotFoundError());
    }

    character.setDomainMastery(domainId, masteryLevel);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
