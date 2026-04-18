import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { CharactersRepository } from '../repositories/characters-repository';
import { UsersRepository } from '@/domain/accounts/application/repositories/users-repository';
import { Character } from '../../enterprise/entities/character';
import { NotAllowedError } from '@/core/errors/not-allowed-error';

interface FetchAllCharactersUseCaseRequest {
  userId: string;
}

type FetchAllCharactersUseCaseResponse = Either<
  NotAllowedError,
  {
    characters: Character[];
  }
>;

@Injectable()
export class FetchAllCharactersUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private usersRepository: UsersRepository,
  ) {}

  async execute({
    userId,
  }: FetchAllCharactersUseCaseRequest): Promise<FetchAllCharactersUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      return left(new NotAllowedError());
    }

    if (!user.isMaster()) {
      return left(new NotAllowedError());
    }

    const characters = await this.charactersRepository.findMany();

    return right({
      characters,
    });
  }
}
