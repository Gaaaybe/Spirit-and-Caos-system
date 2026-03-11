import { Injectable } from '@nestjs/common';
import { type Either, left, right } from '@/core/either';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Power } from '../../enterprise/entities/power';
import { PowerArray } from '../../enterprise/entities/power-array';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { PowerGlobalModificationList } from '../../enterprise/entities/watched-lists/power-global-modification-list';
import { PowerArrayPowerList } from '../../enterprise/entities/watched-lists/power-array-power-list';
import { PowerArraysRepository } from '../repositories/power-arrays-repository';
import { PowersRepository } from '../repositories/powers-repository';

interface CopyPublicPowerArrayUseCaseRequest {
  powerArrayId: string;
  userId: string;
}

interface CopyPublicPowerArrayUseCaseResponseData {
  powerArray: PowerArray;
}

type CopyPublicPowerArrayUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  CopyPublicPowerArrayUseCaseResponseData
>;

@Injectable()
export class CopyPublicPowerArrayUseCase {
  constructor(
    private powerArraysRepository: PowerArraysRepository,
    private powersRepository: PowersRepository,
  ) {}

  async execute({
    powerArrayId,
    userId,
  }: CopyPublicPowerArrayUseCaseRequest): Promise<CopyPublicPowerArrayUseCaseResponse> {
    const original = await this.powerArraysRepository.findById(powerArrayId);

    if (!original) {
      return left(new ResourceNotFoundError());
    }

    if (!original.canBeAccessedBy()) {
      return left(new NotAllowedError());
    }

    // Copia cada poder do acervo para o novo usuário
    const copiedPowers: Power[] = [];
    for (const power of original.powers.getItems()) {
      const effectsList = new PowerEffectList();
      effectsList.update(power.effects.getItems());

      const globalModsList = new PowerGlobalModificationList();
      globalModsList.update(power.globalModifications.getItems());

      const copiedPower = Power.create({
        userId,
        nome: power.nome,
        descricao: power.descricao,
        dominio: power.dominio,
        parametros: power.parametros,
        effects: effectsList,
        globalModifications: globalModsList,
        custoTotal: power.custoTotal,
        custoAlternativo: power.custoAlternativo,
        notas: power.notas,
        isPublic: false,
      });

      await this.powersRepository.create(copiedPower);
      copiedPowers.push(copiedPower);
    }

    const powerList = new PowerArrayPowerList();
    powerList.update(copiedPowers);

    const copy = PowerArray.create({
      userId,
      nome: original.nome,
      descricao: original.descricao,
      dominio: original.dominio,
      parametrosBase: original.parametrosBase,
      powers: powerList,
      custoTotal: original.custoTotal,
      notas: original.notas,
      isPublic: false,
    });

    await this.powerArraysRepository.create(copy);

    return right({ powerArray: copy });
  }
}
