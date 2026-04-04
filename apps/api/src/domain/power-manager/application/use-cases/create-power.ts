import { Injectable, Logger } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { DomainEvents } from '@/core/events/domain-events';
import { AppliedEffect } from '../../enterprise/entities/applied-effect';
import { Peculiarity } from '../../enterprise/entities/peculiarity';
import { Power } from '../../enterprise/entities/power';
import { AlternativeCost } from '../../enterprise/entities/value-objects/alternative-cost';
import { AppliedModification } from '../../enterprise/entities/value-objects/applied-modification';
import { Domain } from '../../enterprise/entities/value-objects/domain';
import { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { PowerGlobalModificationList } from '../../enterprise/entities/watched-lists/power-global-modification-list';
import { PowerCostCalculator } from '../../enterprise/services/power-cost-calculator';
import { PeculiaritiesRepository } from '../repositories/peculiarities-repository';
import { PowersRepository } from '../repositories/powers-repository';
import { InvalidVisibilityError } from './errors/invalid-visibility-error';

interface CreatePowerUseCaseRequest {
  userId?: string;
  nome: string;
  descricao: string;
  dominio: Domain;
  parametros: PowerParameters;
  effects: AppliedEffect[];
  globalModifications?: AppliedModification[];
  custoAlternativo?: AlternativeCost;
  isPublic?: boolean;
  icone?: string;
  notas?: string;
}

interface CreatePowerUseCaseResponseData {
  power: Power;
}

type CreatePowerUseCaseResponse = Either<
  ResourceNotFoundError | InvalidVisibilityError,
  CreatePowerUseCaseResponseData
>;
@Injectable()
export class CreatePowerUseCase {
  private readonly logger = new Logger(CreatePowerUseCase.name);

  constructor(
    private powersRepository: PowersRepository,
    private powerCostCalculator: PowerCostCalculator,
    private peculiaritiesRepository: PeculiaritiesRepository,
  ) {}

  async execute({
    userId,
    nome,
    descricao,
    dominio,
    parametros,
    effects,
    globalModifications = [],
    custoAlternativo,
    isPublic,
    icone,
    notas,
  }: CreatePowerUseCaseRequest): Promise<CreatePowerUseCaseResponse> {
    const costResult = await this.powerCostCalculator.calculate({
      effects,
      parametros,
      globalModifications,
    });

    if (costResult.isLeft()) {
      return left(costResult.value);
    }

    const { custoTotal } = costResult.value;

    const effectsList = new PowerEffectList();
    effectsList.update(effects);

    const globalModificationsList = new PowerGlobalModificationList();
    globalModificationsList.update(globalModifications);

    if (dominio.isPeculiar()) {
      const peculiarityId = dominio.peculiarId;
      if (peculiarityId) {
        const peculiarity = await this.peculiaritiesRepository.findById(peculiarityId);

        if (!peculiarity) {
          if (isPublic) {
            return left(
              new InvalidVisibilityError(
                'Não é possível criar poder público: peculiaridade referenciada não foi encontrada',
              ),
            );
          }

          // Auto-Restauração de Peculiaridades (Ghost Peculiarity):
          // Quando um power importado de outro ambiente aponta para uma
          // peculiaridade que não existe neste banco, criamos um placeholder
          // com o mesmo ID para satisfazer a FK e preservar os dados do power.
          if (!userId) {
            return left(
              new InvalidVisibilityError(
                'Não é possível restaurar peculiaridade durante importação: userId ausente',
              ),
            );
          }

          this.logger.warn(
            `[Ghost Peculiarity] peculiarId "${peculiarityId}" não encontrado — criando placeholder para o power "${nome}" (userId=${userId})`,
          );

          const ghostPeculiarity = Peculiarity.create(
            {
              userId,
              nome: `[Restaurada] Peculiaridade ${peculiarityId.slice(0, 8)}`,
              descricao:
                'Peculiaridade restaurada automaticamente durante importação. Edite com a descrição correta.',
              espiritual: false,
              isPublic: false,
            },
            new UniqueEntityId(peculiarityId),
          );

          await this.peculiaritiesRepository.create(ghostPeculiarity);
        }
      }
    }

    let power = Power.create({
      userId,
      nome,
      descricao,
      dominio,
      parametros,
      effects: effectsList,
      globalModifications: globalModificationsList,
      custoTotal,
      custoAlternativo,
      icone,
      notas,
    });

    if (isPublic) {
      power = power.makePublic();
    }

    await this.powersRepository.create(power);
    await DomainEvents.dispatchEventsForAggregate(power.id);

    return right({
      power,
    });
  }
}
