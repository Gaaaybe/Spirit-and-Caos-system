import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { UnarmedMastery, type UnarmedMasteryProps } from '../../enterprise/entities/value-objects/unarmed-mastery';

interface UpdateUnarmedMasteryUseCaseRequest {
  characterId: string;
  userId: string;
  mastery: UnarmedMasteryProps;
}

type UpdateUnarmedMasteryUseCaseResponse = Either<
  ResourceNotFoundError | DomainValidationError,
  { success: boolean }
>;

@Injectable()
export class UpdateUnarmedMasteryUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    mastery: masteryProps,
  }: UpdateUnarmedMasteryUseCaseRequest): Promise<UpdateUnarmedMasteryUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (character.userId.toString() !== userId) {
      return left(new DomainValidationError('Usuário não autorizado.', 'userId'));
    }

    // Validação das regras de negócio do Domínio Desarmado
    const validationError = UnarmedMastery.validate(masteryProps);
    if (validationError) {
      return left(new DomainValidationError(validationError, 'unarmedMastery'));
    }

    const newMastery = UnarmedMastery.create(masteryProps);
    
    // Cálculo de diferença de PdA
    const currentCost = character.unarmedMastery.totalPdaCost;
    const newCost = newMastery.totalPdaCost;
    const pdaDiff = newCost - currentCost;

    if (pdaDiff > character.pda.availablePda) {
      return left(new DomainValidationError('PdA insuficiente para esta evolução.', 'pda'));
    }

    // Se houver custo, gasta o PdA
    if (pdaDiff > 0) {
      character.spendPda(pdaDiff);
    } else if (pdaDiff < 0) {
      // Se reduziu (ex: reset ou downgrade), devolve PdA
      character.refundPda(Math.abs(pdaDiff));
    }

    character.updateUnarmedMastery(newMastery);

    await this.charactersRepository.save(character);

    return right({ success: true });
  }
}
