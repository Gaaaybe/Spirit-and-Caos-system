import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DomainEvents } from '@/core/events/domain-events';
import type { Power } from '../../enterprise/entities/power';
import type { PowerArray } from '../../enterprise/entities/power-array';
import type { Domain } from '../../enterprise/entities/value-objects/domain';
import { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import type { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerArrayPowerList } from '../../enterprise/entities/watched-lists/power-array-power-list';
import { PowerDependenciesRepository } from '../repositories/power-dependencies-repository';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';
import { PowersRepository } from '../repositories/powers-repository';
import { DependencyConflictError } from './errors/dependency-conflict-error';
import { InvalidVisibilityError } from './errors/invalid-visibility-error';

interface UpdatePowerArrayUseCaseRequest {
  powerArrayId: string;
  userId: string;
  nome?: string;
  descricao?: string;
  dominio?: Domain;
  parametrosBase?: PowerParameters;
  powerIds?: string[];
  notas?: string;
  isPublic?: boolean;
  icone?: string | null;
}

interface UpdatePowerArrayUseCaseResponseData {
  powerArray: PowerArray;
}

type UpdatePowerArrayUseCaseResponse = Either<
  ResourceNotFoundError | InvalidVisibilityError | NotAllowedError | DependencyConflictError,
  UpdatePowerArrayUseCaseResponseData
>;

@Injectable()
export class UpdatePowerArrayUseCase {
  constructor(
    private powerArraysRepository: PowerArraysRepository,
    private powersRepository: PowersRepository,
    private powerDependenciesRepository: PowerDependenciesRepository,
  ) {}

  async execute({
    powerArrayId,
    userId,
    nome,
    descricao,
    dominio,
    parametrosBase,
    powerIds,
    notas,
    isPublic,
    icone,
  }: UpdatePowerArrayUseCaseRequest): Promise<UpdatePowerArrayUseCaseResponse> {
    const existingPowerArray = await this.powerArraysRepository.findById(powerArrayId);

    if (!existingPowerArray) {
      return left(new ResourceNotFoundError());
    }

    if (!existingPowerArray.canBeEditedBy(userId)) {
      return left(new NotAllowedError());
    }

    if (dominio && !dominio.equals(existingPowerArray.dominio)) {
      const isLinkedToAnyItem =
        await this.powerDependenciesRepository.isPowerArrayLinkedToAnyItem(powerArrayId);

      if (isLinkedToAnyItem) {
        return left(
          new DependencyConflictError(
            'Não é possível alterar o domínio deste acervo enquanto ele estiver vinculado a itens',
          ),
        );
      }
    }

    let newPowersList: PowerArrayPowerList | undefined;
    let newCustoTotal: PowerCost | undefined;

    if (powerIds !== undefined) {
      const powers: Power[] = [];
      for (const powerId of powerIds) {
        const power = await this.powersRepository.findById(powerId);
        if (!power) {
          return left(new ResourceNotFoundError());
        }
        powers.push(power);
      }

      newCustoTotal = PowerCost.sum(powers.map((p) => p.custoTotal));

      newPowersList = new PowerArrayPowerList();
      newPowersList.update(powers);
    }

    let updatedPowerArray = existingPowerArray.update({
      nome,
      descricao,
      dominio,
      parametrosBase,
      powers: newPowersList,
      custoTotal: newCustoTotal,
      icone,
      notas,
    });

    if (isPublic !== undefined && isPublic !== existingPowerArray.isPublic) {
      try {
        if (isPublic) {
          updatedPowerArray = updatedPowerArray.makePublic();
        } else {
          updatedPowerArray = updatedPowerArray.makePrivate();
        }
      } catch (error) {
        if (error instanceof Error || error instanceof InvalidVisibilityError) {
          return left(new InvalidVisibilityError(error.message));
        }
        throw error;
      }
    }

    await this.powerArraysRepository.update(updatedPowerArray);
    await DomainEvents.dispatchEventsForAggregate(updatedPowerArray.id);

    return right({
      powerArray: updatedPowerArray,
    });
  }
}
