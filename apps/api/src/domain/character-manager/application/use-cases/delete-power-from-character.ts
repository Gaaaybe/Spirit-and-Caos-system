import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface DeletePowerFromCharacterUseCaseRequest {
  characterId: string;
  userId: string;
  powerId: string;
}

type DeletePowerFromCharacterUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class DeletePowerFromCharacterUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    powerId,
  }: DeletePowerFromCharacterUseCaseRequest): Promise<DeletePowerFromCharacterUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.removePower(powerId);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
