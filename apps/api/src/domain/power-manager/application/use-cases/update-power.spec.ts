import { InMemoryEffectsRepository } from '@test/repositories/in-memory-effects-repository';
import { InMemoryModificationsRepository } from '@test/repositories/in-memory-modifications-repository';
import { InMemoryPeculiaritiesRepository } from '@test/repositories/in-memory-peculiarities-repository';
import { InMemoryPowerDependenciesRepository } from '@test/repositories/in-memory-power-dependencies-repository';
import { InMemoryPowerArraysRepository } from '@test/repositories/in-memory-power-arrays-repository';
import { InMemoryPowersRepository } from '@test/repositories/in-memory-powers-repository';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DomainEvents } from '@/core/events/domain-events';
import { AppliedEffect } from '../../enterprise/entities/applied-effect';
import { EffectBase } from '../../enterprise/entities/effect-base';
import { ModificationBase, ModificationType } from '../../enterprise/entities/modification-base';
import { Peculiarity } from '../../enterprise/entities/peculiarity';
import { Power } from '../../enterprise/entities/power';
import { PowerArray } from '../../enterprise/entities/power-array';
import { AlternativeCost } from '../../enterprise/entities/value-objects/alternative-cost';
import { AppliedModification } from '../../enterprise/entities/value-objects/applied-modification';
import { Domain, DomainName } from '../../enterprise/entities/value-objects/domain';
import { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { PowerArrayPowerList } from '../../enterprise/entities/watched-lists/power-array-power-list';
import { PowerCostCalculator } from '../../enterprise/services/power-cost-calculator';
import { OnPowerMadePublic } from '../subscribers/on-power-made-public';
import { UpdatePowerUseCase } from './update-power';

describe('UpdatePowerUseCase', () => {
  let sut: UpdatePowerUseCase;
  let powersRepository: InMemoryPowersRepository;
  let effectsRepository: InMemoryEffectsRepository;
  let modificationsRepository: InMemoryModificationsRepository;
  let peculiaritiesRepository: InMemoryPeculiaritiesRepository;
  let powerArraysRepository: InMemoryPowerArraysRepository;
  let powerDependenciesRepository: InMemoryPowerDependenciesRepository;
  let powerCostCalculator: PowerCostCalculator;
  const userId = 'user-1';

  beforeEach(() => {
    powersRepository = new InMemoryPowersRepository();
    effectsRepository = new InMemoryEffectsRepository();
    modificationsRepository = new InMemoryModificationsRepository();
    peculiaritiesRepository = new InMemoryPeculiaritiesRepository();
    powerArraysRepository = new InMemoryPowerArraysRepository();
    powerDependenciesRepository = new InMemoryPowerDependenciesRepository();
    powerCostCalculator = new PowerCostCalculator(effectsRepository, modificationsRepository);

    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    new OnPowerMadePublic(peculiaritiesRepository).onModuleInit();

    sut = new UpdatePowerUseCase(
      powersRepository,
      powerCostCalculator,
      peculiaritiesRepository,
      powerArraysRepository,
      powerDependenciesRepository,
    );
  });

  afterEach(() => {
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
  });

  it('should update power name', async () => {
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
      nome: 'Rajada Original',
      descricao: 'Descrição',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powersRepository.create(power);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      nome: 'Rajada Atualizada',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.nome).toBe('Rajada Atualizada');
      expect(result.value.power.descricao).toBe('Descrição');
    }
  });

  it('should update power description and parameters', async () => {
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
      nome: 'Rajada',
      descricao: 'Descrição antiga',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powersRepository.create(power);

    const newParams = PowerParameters.create({ acao: 1, alcance: 2, duracao: 3 });

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      descricao: 'Descrição atualizada',
      parametros: newParams,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.descricao).toBe('Descrição atualizada');
      expect(result.value.power.parametros.acao).toBe(1);
      expect(result.value.power.parametros.alcance).toBe(2);
      expect(result.value.power.parametros.duracao).toBe(3);
      expect(result.value.power.custoTotal.pda).toBe(70);
    }
  });

  it('should update effects and recalculate cost', async () => {
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
      nome: 'Rajada',
      descricao: 'Descrição',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powersRepository.create(power);

    const newEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 20,
      custo: PowerCost.createZero(),
    });

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      effects: [newEffect],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.effects.getItems()).toHaveLength(1);
      expect(result.value.power.effects.getItems()[0].grau).toBe(20);
      expect(result.value.power.custoTotal.pda).toBe(20);
    }
  });

  it('should update global modifications and recalculate cost', async () => {
    const effectBase = EffectBase.create({
      id: 'dano',
      nome: 'Dano',
      custoBase: 1,
      descricao: 'Causa dano',
      categorias: ['Ofensivo'],
    });

    const modificationBase = ModificationBase.create({
      id: 'sutil',
      nome: 'Sutil',
      tipo: ModificationType.EXTRA,
      custoFixo: 0,
      custoPorGrau: 1,
      descricao: 'Efeito sutil',
      categoria: 'Gerais',
    });

    await effectsRepository.create(effectBase);
    await modificationsRepository.create(modificationBase);

    const appliedEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    const power = Power.create({
      nome: 'Rajada',
      descricao: 'Descrição',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powersRepository.create(power);

    const globalModification = AppliedModification.createGlobal('sutil', 1);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      globalModifications: [globalModification],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.globalModifications.getItems()).toHaveLength(1);
      expect(result.value.power.custoTotal.pda).toBe(20);
    }
  });

  it('should update alternative cost', async () => {
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
      nome: 'Rajada',
      descricao: 'Descrição',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powersRepository.create(power);

    const alternativeCost = AlternativeCost.createPE(15);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      custoAlternativo: alternativeCost,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.custoAlternativo).toBeDefined();
      expect(result.value.power.custoAlternativo?.quantidade).toBe(15);
    }
  });

  it('should return error if power not found', async () => {
    const result = await sut.execute({
      powerId: 'poder-inexistente',
      userId,
      nome: 'Novo Nome',
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should return error if effect base not found when updating effects', async () => {
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
      nome: 'Rajada',
      descricao: 'Descrição',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powersRepository.create(power);

    const invalidEffect = AppliedEffect.create({
      effectBaseId: 'inexistente',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      effects: [invalidEffect],
    });

    expect(result.isLeft()).toBe(true);
  });

  it('should make a private power public', async () => {
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
      nome: 'Poder Privado',
      descricao: 'Um poder privado',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
      isPublic: false,
    });

    await powersRepository.create(power);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      isPublic: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.isPublic).toBe(true);
      expect(result.value.power.userId).toBe('user-1');
    }
  });

  it('should make a public power private', async () => {
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
      nome: 'Poder Público',
      descricao: 'Um poder público',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
      isPublic: true,
    });

    await powersRepository.create(power);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      isPublic: false,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.isPublic).toBe(false);
      expect(result.value.power.userId).toBe('user-1');
    }
  });

  it('should make power public and automatically publish referenced private peculiarity', async () => {
    const peculiarity = Peculiarity.create({
      nome: 'Peculiaridade Privada',
      descricao: 'Uma peculiaridade privada',
      userId,
      espiritual: false,
      isPublic: false,
    });

    await peculiaritiesRepository.create(peculiarity);

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
      nome: 'Poder Peculiar',
      descricao: 'Poder com peculiaridade privada',
      dominio: Domain.create({
        name: DomainName.PECULIAR,
        peculiarId: peculiarity.id.toString(),
      }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
      isPublic: false,
    });

    await powersRepository.create(power);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      isPublic: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.isPublic).toBe(true);

      // Verificar que a peculiaridade foi publicada automaticamente
      const updatedPeculiarity = await peculiaritiesRepository.findById(peculiarity.id.toString());
      expect(updatedPeculiarity?.isPublic).toBe(true);
    }
  });

  it('should make power public if it references a public peculiarity', async () => {
    const peculiarity = Peculiarity.create({
      nome: 'Peculiaridade Pública',
      descricao: 'Uma peculiaridade pública',
      userId,
      espiritual: false,
      isPublic: true,
    });

    await peculiaritiesRepository.create(peculiarity);

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
      nome: 'Poder Peculiar',
      descricao: 'Poder com peculiaridade pública',
      dominio: Domain.create({
        name: DomainName.PECULIAR,
        peculiarId: peculiarity.id.toString(),
      }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
      isPublic: false,
    });

    await powersRepository.create(power);

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      isPublic: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.power.isPublic).toBe(true);
    }
  });

  it('should reject domain change when power belongs to array with another domain', async () => {
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
      grau: 5,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    const naturalPower = Power.create({
      nome: 'Rajada Natural',
      descricao: 'Poder natural',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 5, pe: 0, espacos: 5 }),
      userId,
    });

    const companionNaturalPower = Power.create({
      nome: 'Escudo Natural',
      descricao: 'Outro poder natural',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 5, pe: 0, espacos: 5 }),
      userId,
    });

    await powersRepository.create(naturalPower);
    await powersRepository.create(companionNaturalPower);

    const powerArrayList = new PowerArrayPowerList();
    powerArrayList.update([naturalPower, companionNaturalPower]);

    const powerArray = PowerArray.create({
      nome: 'Acervo Natural',
      descricao: 'Acervo com dois poderes naturais',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: powerArrayList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      userId,
    });

    await powerArraysRepository.create(powerArray);

    const result = await sut.execute({
      powerId: naturalPower.id.toString(),
      userId,
      dominio: Domain.create({ name: DomainName.SAGRADO }),
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toContain('Não é possível alterar o domínio deste poder');
    }
  });

  it('should reject domain change when power is linked to items', async () => {
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
      grau: 5,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    const power = Power.create({
      nome: 'Rajada Natural',
      descricao: 'Poder natural',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: effectsList,
      custoTotal: PowerCost.create({ pda: 5, pe: 0, espacos: 5 }),
      userId,
    });

    await powersRepository.create(power);
    powerDependenciesRepository.linkedPowerIds.add(power.id.toString());

    const result = await sut.execute({
      powerId: power.id.toString(),
      userId,
      dominio: Domain.create({ name: DomainName.SAGRADO }),
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value.message).toContain('vinculado a itens');
    }
  });
});
