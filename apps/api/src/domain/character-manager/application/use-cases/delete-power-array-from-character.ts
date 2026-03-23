import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface DeletePowerArrayFromCharacterUseCaseRequest {
  characterId: string;
  userId: string;
  powerArrayId: string;
}

type DeletePowerArrayFromCharacterUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class DeletePowerArrayFromCharacterUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    powerArrayId,
  }: DeletePowerArrayFromCharacterUseCaseRequest): Promise<DeletePowerArrayFromCharacterUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.removePowerArray(powerArrayId);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
