import { InMemoryPeculiaritiesRepository } from '@test/repositories/in-memory-peculiarities-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { Peculiarity } from '../../enterprise/entities/peculiarity';
import { FetchPublicPeculiaritiesUseCase } from './fetch-public-peculiarities';

describe('FetchPublicPeculiaritiesUseCase', () => {
  let sut: FetchPublicPeculiaritiesUseCase;
  let peculiaritiesRepository: InMemoryPeculiaritiesRepository;

  beforeEach(() => {
    peculiaritiesRepository = new InMemoryPeculiaritiesRepository();
    sut = new FetchPublicPeculiaritiesUseCase(peculiaritiesRepository);
  });

  it('should fetch only public peculiarities', async () => {
    const public1 = Peculiarity.create({
      userId: 'user-1',
      nome: 'Telepatia',
      descricao: 'Capacidade de ler mentes e transmitir pensamentos.',
      espiritual: true,
      isPublic: true,
    });

    const public2 = Peculiarity.create({
      userId: 'user-2',
      nome: 'Regeneração',
      descricao: 'Habilidade de se curar rapidamente de ferimentos.',
      espiritual: false,
      isPublic: true,
    });

    const private1 = Peculiarity.create({
      userId: 'user-1',
      nome: 'Invisibilidade',
      descricao: 'Capacidade de se tornar completamente invisível.',
      espiritual: false,
      isPublic: false,
    });

    await peculiaritiesRepository.create(public1);
    await peculiaritiesRepository.create(public2);
    await peculiaritiesRepository.create(private1);

    const result = await sut.execute({ page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.peculiarities).toHaveLength(2);
      const nomes = result.value.peculiarities.map((p) => p.nome);
      expect(nomes).toContain('Telepatia');
      expect(nomes).toContain('Regeneração');
      expect(nomes).not.toContain('Invisibilidade');
    }
  });

  it('should return empty array when no public peculiarities exist', async () => {
    const private1 = Peculiarity.create({
      userId: 'user-1',
      nome: 'Segredo Guardado',
      descricao: 'Uma peculiaridade que ninguém mais pode ver.',
      espiritual: false,
      isPublic: false,
    });

    await peculiaritiesRepository.create(private1);

    const result = await sut.execute({ page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.peculiarities).toHaveLength(0);
    }
  });

  it('should return empty array when no peculiarities exist', async () => {
    const result = await sut.execute({ page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.peculiarities).toHaveLength(0);
    }
  });

  it('should paginate results (20 per page)', async () => {
    for (let i = 1; i <= 25; i++) {
      const peculiarity = Peculiarity.create({
        userId: 'user-1',
        nome: `Peculiaridade Pública ${i}`,
        descricao: `Descrição detalhada da peculiaridade pública número ${i}.`,
        espiritual: i % 2 === 0,
        isPublic: true,
      });
      await peculiaritiesRepository.create(peculiarity);
    }

    const resultPage1 = await sut.execute({ page: 1 });
    const resultPage2 = await sut.execute({ page: 2 });

    expect(resultPage1.isRight()).toBe(true);
    expect(resultPage2.isRight()).toBe(true);

    if (resultPage1.isRight() && resultPage2.isRight()) {
      expect(resultPage1.value.peculiarities).toHaveLength(20);
      expect(resultPage2.value.peculiarities).toHaveLength(5);
    }
  });
});
