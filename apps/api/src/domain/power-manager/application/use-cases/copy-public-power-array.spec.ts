import { InMemoryPowerArraysRepository } from '@test/repositories/in-memory-power-arrays-repository';
import { InMemoryPowersRepository } from '@test/repositories/in-memory-powers-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { AppliedEffect } from '../../enterprise/entities/applied-effect';
import { Power } from '../../enterprise/entities/power';
import { PowerArray } from '../../enterprise/entities/power-array';
import { Domain, DomainName } from '../../enterprise/entities/value-objects/domain';
import { PowerCost } from '../../enterprise/entities/value-objects/power-cost';
import { PowerParameters } from '../../enterprise/entities/value-objects/power-parameters';
import { PowerArrayPowerList } from '../../enterprise/entities/watched-lists/power-array-power-list';
import { PowerEffectList } from '../../enterprise/entities/watched-lists/power-effect-list';
import { CopyPublicPowerArrayUseCase } from './copy-public-power-array';

describe('CopyPublicPowerArrayUseCase', () => {
  let sut: CopyPublicPowerArrayUseCase;
  let powerArraysRepository: InMemoryPowerArraysRepository;
  let powersRepository: InMemoryPowersRepository;

  beforeEach(() => {
    powerArraysRepository = new InMemoryPowerArraysRepository();
    powersRepository = new InMemoryPowersRepository();
    sut = new CopyPublicPowerArrayUseCase(powerArraysRepository, powersRepository);
  });

  function makeEffectList() {
    const appliedEffect = AppliedEffect.create({
      effectBaseId: 'dano',
      grau: 10,
      custo: PowerCost.createZero(),
    });

    const effectsList = new PowerEffectList();
    effectsList.update([appliedEffect]);

    return effectsList;
  }

  function makePower(userId?: string) {
    return Power.create({
      userId,
      nome: 'Rajada de Energia',
      descricao: 'Dispara uma rajada de energia concentrada.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      parametros: PowerParameters.createDefault(),
      effects: makeEffectList(),
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      isPublic: true,
    });
  }

  it('should copy a public power array with all its powers for a user', async () => {
    const power1 = makePower('user-original');
    const power2 = makePower('user-original');
    await powersRepository.create(power1);
    await powersRepository.create(power2);

    const powersList = new PowerArrayPowerList();
    powersList.update([power1, power2]);

    const original = PowerArray.create({
      userId: 'user-original',
      nome: 'Acervo de Combate',
      descricao: 'Coleção de poderes ofensivos para confrontos diretos.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: powersList,
      custoTotal: PowerCost.create({ pda: 20, pe: 0, espacos: 20 }),
      isPublic: true,
    });

    await powerArraysRepository.create(original);

    const result = await sut.execute({
      powerArrayId: original.id.toString(),
      userId: 'usuario-copiando',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const copy = result.value.powerArray;
      expect(copy.id.equals(original.id)).toBe(false);
      expect(copy.userId).toBe('usuario-copiando');
      expect(copy.nome).toBe('Acervo de Combate');
      expect(copy.isPublic).toBe(false);
      expect(copy.powers.getItems()).toHaveLength(2);

      // All copied powers should belong to the new user and be private
      for (const p of copy.powers.getItems()) {
        expect(p.userId).toBe('usuario-copiando');
        expect(p.isPublic).toBe(false);
        expect(p.id.equals(power1.id)).toBe(false);
        expect(p.id.equals(power2.id)).toBe(false);
      }
    }
  });

  it('should persist copied powers in the powers repository', async () => {
    const power = makePower('user-original');
    await powersRepository.create(power);

    const powersList = new PowerArrayPowerList();
    powersList.update([power]);

    const original = PowerArray.create({
      userId: 'user-original',
      nome: 'Acervo Público',
      descricao: 'Coleção de poderes disponível para todos os usuários.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: powersList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      isPublic: true,
    });

    await powerArraysRepository.create(original);

    const initialPowersCount = powersRepository.items.length;

    const result = await sut.execute({
      powerArrayId: original.id.toString(),
      userId: 'user-copia',
    });

    expect(result.isRight()).toBe(true);
    expect(powersRepository.items.length).toBe(initialPowersCount + 1);
  });

  it('should preserve nome, descricao and dominio in the copied array', async () => {
    const power = makePower('user-original');
    await powersRepository.create(power);

    const powersList = new PowerArrayPowerList();
    powersList.update([power]);

    const original = PowerArray.create({
      userId: 'user-original',
      nome: 'Acervo Preservado',
      descricao: 'Dados deste acervo devem ser preservados na cópia gerada.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: powersList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      isPublic: true,
    });

    await powerArraysRepository.create(original);

    const result = await sut.execute({
      powerArrayId: original.id.toString(),
      userId: 'usuario-copiando',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const copy = result.value.powerArray;
      expect(copy.nome).toBe('Acervo Preservado');
      expect(copy.descricao).toBe('Dados deste acervo devem ser preservados na cópia gerada.');
      expect(copy.dominio.name).toBe(DomainName.NATURAL);
      expect(copy.isPublic).toBe(false);
    }
  });

  it('should return ResourceNotFoundError if power array does not exist', async () => {
    const result = await sut.execute({
      powerArrayId: 'acervo-inexistente',
      userId: 'qualquer-usuario',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError when trying to copy a private power array', async () => {
    const power = makePower('dono-original');
    await powersRepository.create(power);

    const powersList = new PowerArrayPowerList();
    powersList.update([power]);

    const privateArray = PowerArray.create({
      userId: 'dono-original',
      nome: 'Acervo Privado',
      descricao: 'Coleção secreta que somente seu dono pode acessar.',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      powers: powersList,
      custoTotal: PowerCost.create({ pda: 10, pe: 0, espacos: 10 }),
      isPublic: false,
    });

    await powerArraysRepository.create(privateArray);

    const result = await sut.execute({
      powerArrayId: privateArray.id.toString(),
      userId: 'outro-usuario',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
