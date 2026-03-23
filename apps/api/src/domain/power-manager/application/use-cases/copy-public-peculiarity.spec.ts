import { InMemoryPeculiaritiesRepository } from '@test/repositories/in-memory-peculiarities-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Peculiarity } from '../../enterprise/entities/peculiarity';
import { CopyPublicPeculiarityUseCase } from './copy-public-peculiarity';

describe('CopyPublicPeculiarityUseCase', () => {
  let sut: CopyPublicPeculiarityUseCase;
  let peculiaritiesRepository: InMemoryPeculiaritiesRepository;

  beforeEach(() => {
    peculiaritiesRepository = new InMemoryPeculiaritiesRepository();
    sut = new CopyPublicPeculiarityUseCase(peculiaritiesRepository);
  });

  it('should copy a public peculiarity for a user', async () => {
    const original = Peculiarity.create({
      userId: 'outro-usuario',
      nome: 'Telepatia Avançada',
      descricao: 'Capacidade de ler mentes e transmitir pensamentos à distância.',
      espiritual: true,
      isPublic: true,
    });

    await peculiaritiesRepository.create(original);

    const result = await sut.execute({
      peculiarityId: original.id.toString(),
      userId: 'usuario-copiando',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const copy = result.value.peculiarity;
      expect(copy.id.equals(original.id)).toBe(false);
      expect(copy.userId).toBe('usuario-copiando');
      expect(copy.nome).toBe('Telepatia Avançada');
      expect(copy.descricao).toBe('Capacidade de ler mentes e transmitir pensamentos à distância.');
      expect(copy.espiritual).toBe(true);
      expect(copy.isPublic).toBe(false);
    }
  });

  it('should persist the copied peculiarity in the repository', async () => {
    const original = Peculiarity.create({
      userId: 'user-original',
      nome: 'Regeneração',
      descricao: 'Habilidade de se curar rapidamente de ferimentos graves.',
      espiritual: false,
      isPublic: true,
    });

    await peculiaritiesRepository.create(original);

    const result = await sut.execute({
      peculiarityId: original.id.toString(),
      userId: 'user-copia',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const copy = result.value.peculiarity;
      const found = await peculiaritiesRepository.findById(copy.id.toString());
      expect(found).not.toBeNull();
      expect(found?.userId).toBe('user-copia');
    }
  });

  it('should return ResourceNotFoundError if peculiarity does not exist', async () => {
    const result = await sut.execute({
      peculiarityId: 'peculiaridade-inexistente',
      userId: 'qualquer-usuario',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError when trying to copy a private peculiarity', async () => {
    const private1 = Peculiarity.create({
      userId: 'dono-original',
      nome: 'Poder Secreto',
      descricao: 'Uma peculiaridade que seu dono mantém em segredo absoluto.',
      espiritual: false,
      isPublic: false,
    });

    await peculiaritiesRepository.create(private1);

    const result = await sut.execute({
      peculiarityId: private1.id.toString(),
      userId: 'outro-usuario',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
