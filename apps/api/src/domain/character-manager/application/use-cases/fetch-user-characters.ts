import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';

interface FetchUserCharactersUseCaseRequest {
  userId: string;
}

type FetchUserCharactersUseCaseResponse = Either<
  null,
  {
    characters: Character[];
  }
>;

@Injectable()
export class FetchUserCharactersUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    userId,
  }: FetchUserCharactersUseCaseRequest): Promise<FetchUserCharactersUseCaseResponse> {
    const characters = await this.charactersRepository.findByUserId(userId);

    return right({
      characters,
    });
  }
}
