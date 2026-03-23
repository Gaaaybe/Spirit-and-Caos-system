import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface EquipPowerArrayUseCaseRequest {
  characterId: string;
  userId: string;
  powerArrayId: string;
}

type EquipPowerArrayUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
  {
    character: Character;
  }
>;

@Injectable()
export class EquipPowerArrayUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    powerArrayId,
  }: EquipPowerArrayUseCaseRequest): Promise<EquipPowerArrayUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    try {
      character.equipPowerArray(powerArrayId);
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
