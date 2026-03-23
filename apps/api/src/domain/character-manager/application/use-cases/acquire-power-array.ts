import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { PowerArraysLookupPort } from '../repositories/power-arrays-lookup-port';
import { AcquirePowerArrayService } from '../../enterprise/services/acquire-power-array';
import { Character } from '../../enterprise/entities/character';

interface AcquirePowerArrayUseCaseRequest {
  characterId: string;
  userId: string;
  powerArrayId: string;
}

type AcquirePowerArrayUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
    globalModificationIdToInject: string | null;
  }
>;

@Injectable()
export class AcquirePowerArrayUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private powerArraysLookupPort: PowerArraysLookupPort,
    private acquirePowerArrayService: AcquirePowerArrayService,
  ) {}

  async execute({
    characterId,
    userId,
    powerArrayId,
  }: AcquirePowerArrayUseCaseRequest): Promise<AcquirePowerArrayUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const arrayInfo = await this.powerArraysLookupPort.findById(powerArrayId);

    if (!arrayInfo) {
      return left(new ResourceNotFoundError());
    }

    const newInstanceId = await this.powerArraysLookupPort.createCharacterInstance(
      arrayInfo.id,
      characterId,
      userId,
    );

    if (!newInstanceId) {
      return left(new ResourceNotFoundError());
    }

    const result = this.acquirePowerArrayService.execute({
      character,
      powerArrayId: newInstanceId,
      domainId: arrayInfo.domainId,
      slotCost: arrayInfo.slotCost,
      calculatedFinalCost: arrayInfo.pdaCost,
    });

    if (result.isLeft()) {
      return left(result.value);
    }

    await this.charactersRepository.save(character);

    return right({
      character,
      globalModificationIdToInject: result.value.globalModificationIdToInject,
    });
  }
}
