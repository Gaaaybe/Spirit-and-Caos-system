import { InMemoryEffectsRepository } from '@test/repositories/in-memory-effects-repository';
import { InMemoryPowerArraysRepository } from '@test/repositories/in-memory-power-arrays-repository';
import { InMemoryPowerDependenciesRepository } from '@test/repositories/in-memory-power-dependencies-repository';
import { InMemoryPowersRepository } from '@test/repositories/in-memory-powers-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppliedEffect } from '../../enterprise/entities/applied-effect';
import { EffectBase } from '../../enterprise/entities/effect-base';
import { Power } from '../../enterprise/entities/power';
import { PowerArray } from '../../enterprise/entities/power-array';
import { Domain, DomainName } from '../../enterprise/entities/value-objects/domain';
import { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerArrayPowerList } from '../../enterprise/entities/watched-lists/power-array-power-list';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { DeletePowerUseCase } from './delete-power';

describe('DeletePowerUseCase', () => {
  let sut: DeletePowerUseCase;
  let powersRepository: InMemoryPowersRepository;
  let powerArraysRepository: InMemoryPowerArraysRepository;
  let powerDependenciesRepository: InMemoryPowerDependenciesRepository;
  let effectsRepository: InMemoryEffectsRepository;
  const userId = 'user-1';

  beforeEach(() => {
    powersRepository = new InMemoryPowersRepository();
    powerArraysRepository = new InMemoryPowerArraysRepository();
    powerDependenciesRepository = new InMemoryPowerDependenciesRepository();
    effectsRepository = new InMemoryEffectsRepository();
    sut = new DeletePowerUseCase(
      powersRepository,
      powerArraysRepository,
      powerDependenciesRepository,
    );
  });

  it('should delete an existing power', async () => {
    const effectBase = EffectBase.create({
      id: 'dano',
      nome: 'Dano',
      custoBase: 1,
      descricao: 'Causa dano',
      categorias: ['Ofensivo'],
    });

    await effectsRepository.create(effectBase);

    const appliedEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    const power = Power.create({
      userId,
      nome: 'Rajada de Energia',
      descricao: 'Dispara uma rajada de energia',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
    });

    await powersRepository.create(power);

    expect(powersRepository.items).toHaveLength(1);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
    });

    expect(result.isRight()).toBe(true);
    expect(powersRepository.items).toHaveLength(0);
  });

  it('should return error if power does not exist', async () => {
    const result = await sut.execute({
      powerId: 'poder-inexistente',
      userId,
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should not affect other powers when deleting', async () => {
    const effectBase = EffectBase.create({
      id: 'dano',
      nome: 'Dano',
      custoBase: 1,
      descricao: 'Causa dano',
      categorias: ['Ofensivo'],
    });

    await effectsRepository.create(effectBase);

    const appliedEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const effectsList1 = new PowerEffectList();
    effectsList1.update([appliedEffect]);

    const power1 = Power.create({
      userId,
      nome: 'Rajada 1',
      descricao: 'Primeiro poder',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList1,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
    });

    const effectsList2 = new PowerEffectList();
    effectsList2.update([appliedEffect]);

    const power2 = Power.create({
      userId,
      nome: 'Rajada 2',
      descricao: 'Segundo poder',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList2,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
    });

    await powersRepository.create(power1);
    await powersRepository.create(power2);

    expect(powersRepository.items).toHaveLength(2);

    await sut.execute({
      powerId: power1.id.toString(),
      userId,
    });

    expect(powersRepository.items).toHaveLength(1);
    expect(powersRepository.items[0].id.equals(power2.id)).toBe(true);
  });

  it('should reject delete when power is linked to an item', async () => {
    const effectBase = EffectBase.create({
      id: 'dano',
      nome: 'Dano',
      custoBase: 1,
      descricao: 'Causa dano',
      categorias: ['Ofensivo'],
    });

    await effectsRepository.create(effectBase);

    const appliedEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    const power = Power.create({
      userId,
      nome: 'Rajada de Energia',
      descricao: 'Dispara uma rajada de energia',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
    });

    await powersRepository.create(power);
    powerDependenciesRepository.linkedPowerIds.add(power.id.toString());

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(powersRepository.items).toHaveLength(1);
  });

  it('should reject delete when linked array would become empty', async () => {
    const effectBase = EffectBase.create({
      id: 'dano',
      nome: 'Dano',
      custoBase: 1,
      descricao: 'Causa dano',
      categorias: ['Ofensivo'],
    });

    await effectsRepository.create(effectBase);

    const appliedEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    const power = Power.create({
      userId,
      nome: 'Rajada Única',
      descricao: 'Poder único do acervo',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
    });

    await powersRepository.create(power);

    const powersList = new PowerArrayPowerList();
    powersList.update([power]);

    const powerArray = PowerArray.create({
      userId,
      nome: 'Acervo Unitário',
      descricao: 'Acervo com um único poder',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: powersList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
    });

    await powerArraysRepository.create(powerArray);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(powersRepository.items).toHaveLength(1);
  });
});
