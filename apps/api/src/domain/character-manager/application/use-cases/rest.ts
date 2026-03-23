import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { RestService, RestQuality } from '../../enterprise/services/rest-service';

interface RestUseCaseRequest {
  characterId: string;
  userId: string;
  quality: RestQuality;
  durationHours: number;
  hasCare: boolean;
}

type RestUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
    pvChange: number;
    peChange: number;
  }
>;

@Injectable()
export class RestUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private restService: RestService,
  ) {}

  async execute({
    characterId,
    userId,
    quality,
    durationHours,
    hasCare,
  }: RestUseCaseRequest): Promise<RestUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const roll = (sides: number) => Math.floor(Math.random() * sides) + 1;

    const result = this.restService.execute({
      quality,
      durationHours,
      hasCare,
      hasInjury: character.hasInjury,
      maxPV: character.health.maxPV,
      maxPE: character.energy.maxPE,
      currentPV: character.health.currentPV,
      currentPE: character.energy.currentPE,
      rolls: {
        pvRoll1: roll(character.health.maxPV),
        pvRoll2: roll(character.health.maxPV),
        peRoll1: roll(character.energy.maxPE),
        peRoll2: roll(character.energy.maxPE),
        injuryPenaltyPvRoll: roll(character.health.currentPV || 1),
        injuryPenaltyPeRoll: roll(character.energy.currentPE || 1),
      },
    });

    character.applyRestResult(result.pvChange, result.peChange);

    await this.charactersRepository.save(character);

    return right({
      character,
      pvChange: result.pvChange,
      peChange: result.peChange,
    });
  }
}
