import { InMemoryPowersRepository } from '@test/repositories/in-memory-powers-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { AppliedEffect } from '../../enterprise/entities/applied-effect';
import { Power } from '../../enterprise/entities/power';
import { Domain, DomainName } from '../../enterprise/entities/value-objects/domain';
import { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { FetchUserPowersUseCase } from './fetch-user-powers';

function makePower(userId: string, nome: string, isPublic = false): Power {
  const appliedEffect = AppliedEffect.create({
    effectBaseId: 'dano',
    grau: 1,
    custo: PowerCost.createZero(),
  });

  const effects = new PowerEffectList();
  effects.update([appliedEffect]);

  return Power.create({
    userId,
    nome,
    descricao: `Descrição de ${nome}`,
    dominio: Domain.create({ name: DomainName.NATURAL }),
    parametros: PowerParameters.createDefault(),
    effects,
    custoTotal: PowerCost.create({ pda: 2, pe: 2, espacos: 2 }),
    isPublic,
  });
}

describe('FetchUserPowersUseCase', () => {
  let sut: FetchUserPowersUseCase;
  let powersRepository: InMemoryPowersRepository;

  beforeEach(() => {
    powersRepository = new InMemoryPowersRepository();
    sut = new FetchUserPowersUseCase(powersRepository);
  });

  it('should fetch only the powers belonging to the given user', async () => {
    const power1 = makePower('user-1', 'Rajada de Fogo');
    const power2 = makePower('user-1', 'Escudo de Luz', true);
    const power3 = makePower('user-2', 'Poder do Outro');

    await powersRepository.create(power1);
    await powersRepository.create(power2);
    await powersRepository.create(power3);

    const result = await sut.execute({ userId: 'user-1', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powers).toHaveLength(2);
      expect(result.value.powers.every((p) => p.userId === 'user-1')).toBe(true);
    }
  });

  it('should return private and public powers of the user (no filter by visibility)', async () => {
    const privateP = makePower('user-1', 'Privado', false);
    const publicP = makePower('user-1', 'Público', true);

    await powersRepository.create(privateP);
    await powersRepository.create(publicP);

    const result = await sut.execute({ userId: 'user-1', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powers).toHaveLength(2);
    }
  });

  it('should return empty array when user has no powers', async () => {
    const result = await sut.execute({ userId: 'user-sem-poderes', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powers).toHaveLength(0);
    }
  });

  it('should paginate — page 1 returns up to 20 items', async () => {
    for (let i = 1; i <= 25; i++) {
      await powersRepository.create(makePower('user-1', `Poder ${i}`));
    }

    const result = await sut.execute({ userId: 'user-1', page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powers).toHaveLength(20);
    }
  });

  it('should paginate — page 2 returns the remaining items', async () => {
    for (let i = 1; i <= 25; i++) {
      await powersRepository.create(makePower('user-1', `Poder ${i}`));
    }

    const result = await sut.execute({ userId: 'user-1', page: 2 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powers).toHaveLength(5);
    }
  });
});
