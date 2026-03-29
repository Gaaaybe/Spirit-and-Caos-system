import type { Either } from '@/core/either';
import type { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import type { AppliedEffect } from '../../enterprise/entities/applied-effect';
import type { AppliedModification } from '../../enterprise/entities/value-objects/applied-modification';
import type { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import type { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import type { PowerCostCalculator } from '../../enterprise/services/power-cost-calculator';

interface CalculatePowerCostUseCaseRequest {
  effects: AppliedEffect[];
  parametros: PowerParameters;
  globalModifications?: AppliedModification[];
}

interface CalculatePowerCostUseCaseResponseData {
  custoTotal: PowerCost;
  custoPorEfeito: Map<string, PowerCost>;
}

type CalculatePowerCostUseCaseResponse = Either<
  ResourceNotFoundError,
  CalculatePowerCostUseCaseResponseData
>;

export class CalculatePowerCostUseCase {
  constructor(private powerCostCalculator: PowerCostCalculator) {}

  async execute({
    effects,
    parametros,
    globalModifications = [],
  }: CalculatePowerCostUseCaseRequest): Promise<CalculatePowerCostUseCaseResponse> {
    return this.powerCostCalculator.calculate({
      effects,
      parametros,
      globalModifications,
    });
  }
}
