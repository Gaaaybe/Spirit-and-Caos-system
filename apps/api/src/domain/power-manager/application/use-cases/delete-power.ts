import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { PowerDependenciesRepository } from '../repositories/power-dependencies-repository';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';
import { PowersRepository } from '../repositories/powers-repository';
import { DependencyConflictError } from './errors/dependency-conflict-error';

interface DeletePowerUseCaseRequest {
  powerId: string;
  userId: string;
}

type DeletePowerUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DependencyConflictError,
  null
>;

@Injectable()
export class DeletePowerUseCase {
  constructor(
    private powersRepository: PowersRepository,
    private powerArraysRepository: PowerArraysRepository,
    private powerDependenciesRepository: PowerDependenciesRepository,
  ) {}

  async execute({
    powerId,
    userId,
  }: DeletePowerUseCaseRequest): Promise<DeletePowerUseCaseResponse> {
    const existingPower = await this.powersRepository.findById(powerId);

    if (!existingPower) {
      return left(new ResourceNotFoundError());
    }

    if (!existingPower.canBeEditedBy(userId)) {
      return left(new NotAllowedError());
    }

    const linkedPowerArrays = await this.powerArraysRepository.findByPowerId(powerId);
    const orphaningArray = linkedPowerArrays.find((array) => array.powers.getItems().length <= 1);

    if (orphaningArray) {
      return left(
        new DependencyConflictError(
          `Não é possível excluir o poder porque o acervo "${orphaningArray.nome}" ficaria sem poderes`,
        ),
      );
    }

    const isLinkedToAnyItem =
      await this.powerDependenciesRepository.isPowerLinkedToAnyItem(powerId);
    if (isLinkedToAnyItem) {
      return left(
        new DependencyConflictError(
          'Não é possível excluir o poder porque ele está vinculado a pelo menos um item',
        ),
      );
    }

    await this.powersRepository.delete(powerId);

    return right(null);
  }
}
