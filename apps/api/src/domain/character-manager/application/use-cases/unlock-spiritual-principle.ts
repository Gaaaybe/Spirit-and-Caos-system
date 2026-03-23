import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { SpiritualStage } from '../../enterprise/entities/value-objects/spiritual-principle';

interface UnlockSpiritualPrincipleUseCaseRequest {
  characterId: string;
  userId: string;
  stage?: SpiritualStage;
}

type UnlockSpiritualPrincipleUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
  {
    character: Character;
  }
>;

@Injectable()
export class UnlockSpiritualPrincipleUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    stage = 'NORMAL',
  }: UnlockSpiritualPrincipleUseCaseRequest): Promise<UnlockSpiritualPrincipleUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    try {
      character.unlockSpiritualPrinciple(stage);
    } catch (error) {
      if (error instanceof DomainValidationError) {
        return left(error);
      }
      throw error;
    }

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
