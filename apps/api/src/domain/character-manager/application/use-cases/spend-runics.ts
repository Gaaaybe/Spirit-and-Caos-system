import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

interface SpendRunicsUseCaseRequest {
  characterId: string;
  userId: string;
  amount: number;
}

type SpendRunicsUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
  {
    character: Character;
  }
>;

@Injectable()
export class SpendRunicsUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    amount,
  }: SpendRunicsUseCaseRequest): Promise<SpendRunicsUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    try {
      character.spendRunics(amount);
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
