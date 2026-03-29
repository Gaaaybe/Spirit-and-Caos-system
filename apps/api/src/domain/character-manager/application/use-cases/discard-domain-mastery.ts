import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface DiscardDomainMasteryUseCaseRequest {
  characterId: string;
  userId: string;
  domainId: string;
}

type DiscardDomainMasteryUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class DiscardDomainMasteryUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    domainId,
  }: DiscardDomainMasteryUseCaseRequest): Promise<DiscardDomainMasteryUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.removeDomainMastery(domainId);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
