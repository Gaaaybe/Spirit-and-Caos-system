import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface AddRunicsUseCaseRequest {
  characterId: string;
  userId: string;
  amount: number;
}

type AddRunicsUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class AddRunicsUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    amount,
  }: AddRunicsUseCaseRequest): Promise<AddRunicsUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.addRunics(amount);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
