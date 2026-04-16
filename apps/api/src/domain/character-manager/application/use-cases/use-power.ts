import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { PowersRepository } from '@/domain/power-manager/application/repositories/powers-repository';
import { Character } from '../../enterprise/entities/character';
import { NotAllowedError } from './errors/not-allowed-error';

interface UsePowerUseCaseRequest {
  characterId: string;
  userId: string;
  powerId: string;
  peCost?: number;
}

type UsePowerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
  { character: Character; peCost: number }
>;

@Injectable()
export class UsePowerUseCase {
  constructor(
    private charactersRepository: CharactersRepository,
    private powersRepository: PowersRepository,
  ) {}

  async execute({ characterId, userId, powerId, peCost: providedPeCost }: UsePowerUseCaseRequest): Promise<UsePowerUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    const power = await this.powersRepository.findById(powerId);

    if (!power) {
      return left(new ResourceNotFoundError());
    }

    const peCost = providedPeCost ?? power.custoTotal.pe;

    if (peCost > 0) {
      character.consumeEnergy(peCost);
    }

    await this.charactersRepository.save(character);

    return right({ character, peCost });
  }
}
