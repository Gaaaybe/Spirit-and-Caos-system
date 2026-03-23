import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface GetCharacterByIdUseCaseRequest {
  characterId: string;
}

type GetCharacterByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    character: Character;
  }
>;

@Injectable()
export class GetCharacterByIdUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
  }: GetCharacterByIdUseCaseRequest): Promise<GetCharacterByIdUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    return right({
      character,
    });
  }
}
