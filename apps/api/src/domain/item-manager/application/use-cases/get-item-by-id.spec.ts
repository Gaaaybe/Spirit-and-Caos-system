import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { Artifact } from '../../enterprise/entities/artifact';
import { GetItemByIdUseCase } from './get-item-by-id';

describe('GetItemByIdUseCase', () => {
  let sut: GetItemByIdUseCase;
  let itemsRepository: InMemoryItemsRepository;

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    sut = new GetItemByIdUseCase(itemsRepository);
  });

  it('should return an item by id', async () => {
    const artifact = Artifact.create({
      userId: 'user-1',
      nome: 'Amuleto Ancestral',
      descricao: 'Um amuleto com poderes místicos antigos',
      dominio: Domain.create({ name: DomainName.SAGRADO }),
      custoBase: 50,
      nivelItem: 3,
    });

    await itemsRepository.create(artifact);

    const result = await sut.execute({ itemId: artifact.id.toString() });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.id.equals(artifact.id)).toBe(true);
      expect(result.value.item.nome).toBe('Amuleto Ancestral');
    }
  });

  it('should return ResourceNotFoundError if item does not exist', async () => {
    const result = await sut.execute({ itemId: 'inexistente' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
