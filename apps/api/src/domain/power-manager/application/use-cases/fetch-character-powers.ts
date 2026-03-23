import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { PowersRepository } from '../repositories/powers-repository';
import { Power } from '../../enterprise/entities/power';

interface FetchCharacterPowersUseCaseRequest {
  characterId: string;
}

type FetchCharacterPowersUseCaseResponse = Either<
  null,
  {
    powers: Power[];
  }
>;

@Injectable()
export class FetchCharacterPowersUseCase {
  constructor(private powersRepository: PowersRepository) {}

  async execute({
    characterId,
  }: FetchCharacterPowersUseCaseRequest): Promise<FetchCharacterPowersUseCaseResponse> {
    const powers = await this.powersRepository.findByCharacterId(characterId);

    return right({
      powers,
    });
  }
}
