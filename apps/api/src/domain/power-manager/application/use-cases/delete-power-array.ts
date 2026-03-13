import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { PowerDependenciesRepository } from '../repositories/power-dependencies-repository';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';
import { DependencyConflictError } from './errors/dependency-conflict-error';

interface DeletePowerArrayUseCaseRequest {
  powerArrayId: string;
  userId: string;
}

type DeletePowerArrayUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DependencyConflictError,
  null
>;

@Injectable()
export class DeletePowerArrayUseCase {
  constructor(
    private powerArraysRepository: PowerArraysRepository,
    private powerDependenciesRepository: PowerDependenciesRepository,
  ) {}

  async execute({
    powerArrayId,
    userId,
  }: DeletePowerArrayUseCaseRequest): Promise<DeletePowerArrayUseCaseResponse> {
    const powerArray = await this.powerArraysRepository.findById(powerArrayId);

    if (!powerArray) {
      return left(new ResourceNotFoundError());
    }

    if (!powerArray.canBeEditedBy(userId)) {
      return left(new NotAllowedError());
    }

    const isLinkedToAnyItem =
      await this.powerDependenciesRepository.isPowerArrayLinkedToAnyItem(powerArrayId);
    if (isLinkedToAnyItem) {
      return left(
        new DependencyConflictError(
          'Não é possível excluir o acervo porque ele está vinculado a pelo menos um item',
        ),
      );
    }

    await this.powerArraysRepository.delete(powerArrayId);

    return right(null);
  }
}
