import { InMemoryPowerArraysRepository } from '@test/repositories/in-memory-power-arrays-repository';
import { InMemoryPowersRepository } from '@test/repositories/in-memory-powers-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppliedEffect } from '../../enterprise/entities/applied-effect';
import { Power } from '../../enterprise/entities/power';
import { PowerArray } from '../../enterprise/entities/power-array';
import { Domain, DomainName } from '../../enterprise/entities/value-objects/domain';
import { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerArrayPowerList } from '../../enterprise/entities/watched-lists/power-array-power-list';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { FetchUserPowerArraysUseCase } from './fetch-user-power-arrays';

function makePower(): Power {
  const appliedEffect = AppliedEffect.create({
    effectBaseId: 'dano',
    grau: 1,
    custo: PowerCost.createZero(),
  });

  const effects = new PowerEffectList();
  effects.update([appliedEffect]);

  return Power.create({
    nome: 'Poder Base',
    descricao: 'Poder para compor acervos',
    dominio: Domain.create({ name: DomainName.NATURAL }),
    parametros: PowerParameters.createDefault(),
    effects,
    custoTotal: PowerCost.create({ pda: 2, pe: 2, espacos: 2 }),
  });
}

function makePowerArray(userId: string, nome: string, isPublic = false): PowerArray {
  const power = makePower();
  const powers = new PowerArrayPowerList();
  powers.update([power]);

  return PowerArray.create({
    userId,
    nome,
    descricao: `Descrição do acervo ${nome}`,
    dominio: Domain.create({ name: DomainName.NATURAL }),
    powers,
    custoTotal: PowerCost.create({ pda: 3, pe: 2, espacos: 2 }),
    isPublic,
    parametrosBase: PowerParameters.createDefault(),
  });
}

describe('FetchUserPowerArraysUseCase', () => {
  let sut: FetchUserPowerArraysUseCase;
  let powerArraysRepository: InMemoryPowerArraysRepository;
  let _powersRepository: InMemoryPowersRepository;

  beforeEach(() => {
    powerArraysRepository = new InMemoryPowerArraysRepository();
    _powersRepository = new InMemoryPowersRepository();
    sut = new FetchUserPowerArraysUseCase(powerArraysRepository);
  });

  it('should fetch only the power arrays belonging to the given user', async () => {
    const array1 = makePowerArray('user-1', 'Acervo do Trovão');
    const array2 = makePowerArray('user-1', 'Acervo da Luz', true);
    const array3 = makePowerArray('user-2', 'Acervo do Outro');

    await powerArraysRepository.create(array1);
    await powerArraysRepository.create(array2);
    await powerArraysRepository.create(array3);

    const result = await sut.execute({ userId: 'user-1', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powerArrays).toHaveLength(2);
      expect(result.value.powerArrays.every((a) => a.userId === 'user-1')).toBe(true);
    }
  });

  it('should return private and public arrays of the user (no filter by visibility)', async () => {
    const privateA = makePowerArray('user-1', 'Privado', false);
    const publicA = makePowerArray('user-1', 'Público', true);

    await powerArraysRepository.create(privateA);
    await powerArraysRepository.create(publicA);

    const result = await sut.execute({ userId: 'user-1', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powerArrays).toHaveLength(2);
    }
  });

  it('should return empty array when user has no power arrays', async () => {
    const result = await sut.execute({ userId: 'user-sem-acervos', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powerArrays).toHaveLength(0);
    }
  });

  it('should paginate — page 1 returns up to 20 items', async () => {
    for (let i = 1; i <= 25; i++) {
      await powerArraysRepository.create(makePowerArray('user-1', `Acervo ${i}`));
    }

    const result = await sut.execute({ userId: 'user-1', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powerArrays).toHaveLength(20);
    }
  });

  it('should paginate — page 2 returns the remaining items', async () => {
    for (let i = 1; i <= 25; i++) {
      await powerArraysRepository.create(makePowerArray('user-1', `Acervo ${i}`));
    }

    const result = await sut.execute({ userId: 'user-1', page: 2 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powerArrays).toHaveLength(5);
    }
  });
});
