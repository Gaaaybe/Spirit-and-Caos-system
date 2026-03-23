import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { ConditionName } from '../../enterprise/entities/value-objects/condition-manager';

interface RemoveConditionUseCaseRequest {
  characterId: string;
  userId: string;
  condition: ConditionName;
}

type RemoveConditionUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class RemoveConditionUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    condition,
  }: RemoveConditionUseCaseRequest): Promise<RemoveConditionUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.removeCondition(condition);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
