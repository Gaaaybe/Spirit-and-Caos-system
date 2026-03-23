import { Injectable } from '@nestjs/common';
import { Either, right } from '@/core/either';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';
import { PowerArray } from '../../enterprise/entities/power-array';

interface FetchCharacterPowerArraysUseCaseRequest {
  characterId: string;
}

type FetchCharacterPowerArraysUseCaseResponse = Either<
  null,
  {
    powerArrays: PowerArray[];
  }
>;

@Injectable()
export class FetchCharacterPowerArraysUseCase {
  constructor(private powerArraysRepository: PowerArraysRepository) {}

  async execute({
    characterId,
  }: FetchCharacterPowerArraysUseCaseRequest): Promise<FetchCharacterPowerArraysUseCaseResponse> {
    const powerArrays = await this.powerArraysRepository.findByCharacterId(characterId);

    return right({
      powerArrays,
    });
  }
}
