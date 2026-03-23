import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { PowersLookupPort } from '../repositories/powers-lookup-port';
import { AcquirePowerService } from '../../enterprise/services/acquire-power';
import { Character } from '../../enterprise/entities/character';

interface AcquirePowerUseCaseRequest {
  characterId: string;
  userId: string;
  powerId: string;
}

type AcquirePowerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
    globalModificationIdToInject: string | null;
  }
>;

@Injectable()
export class AcquirePowerUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private powersLookupPort: PowersLookupPort,
    private acquirePowerService: AcquirePowerService,
  ) {}

  async execute({
    characterId,
    userId,
    powerId,
  }: AcquirePowerUseCaseRequest): Promise<AcquirePowerUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const powerInfo = await this.powersLookupPort.findById(powerId);

    if (!powerInfo) {
      return left(new ResourceNotFoundError());
    }

    const newInstanceId = await this.powersLookupPort.createCharacterInstance(
      powerInfo.id,
      characterId,
      userId,
    );

    if (!newInstanceId) {
      return left(new ResourceNotFoundError());
    }

    const result = this.acquirePowerService.execute({
      character,
      powerId: newInstanceId,
      domainId: powerInfo.domainId,
      slotCost: powerInfo.slotCost,
      calculatedFinalCost: powerInfo.pdaCost,
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
