import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { CopyPublicItemUseCase } from './copy-public-item';

describe('CopyPublicItemUseCase', () => {
  let sut: CopyPublicItemUseCase;
  let itemsRepository: InMemoryItemsRepository;

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    sut = new CopyPublicItemUseCase(itemsRepository);
  });

  function makeWeapon(overrides: { userId?: string; isPublic?: boolean } = {}) {
    return Weapon.create({
      userId: overrides.userId,
      nome: 'Espada Longa',
      descricao: 'Uma espada de corte bem equilibrada para combate',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.CORPO_A_CORPO,
      isPublic: overrides.isPublic ?? false,
    });
  }

  it('should copy a public user item', async () => {
    const original = makeWeapon({ userId: 'outro-user', isPublic: true });
    await itemsRepository.create(original);

    const result = await sut.execute({
      itemId: original.id.toString(),
      userId: 'user-copiando',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const copy = result.value.item;
      expect(copy.id.equals(original.id)).toBe(false);
      expect(copy.userId).toBe('user-copiando');
      expect(copy.nome).toBe('Espada Longa');
      expect(copy.isPublic).toBe(false);
      expect(itemsRepository.items).toHaveLength(2);
    }
  });

  it('should copy an official item', async () => {
    const official = makeWeapon({ userId: undefined }); // oficial
    await itemsRepository.create(official);

    const result = await sut.execute({
      itemId: official.id.toString(),
      userId: 'qualquer-user',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.isOwnedBy('qualquer-user')).toBe(true);
      expect(result.value.item.isPublic).toBe(false);
    }
  });

  it('should return ResourceNotFoundError if item does not exist', async () => {
    const result = await sut.execute({ itemId: 'inexistente', userId: 'user-1' });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError if item is private and not official', async () => {
    const privateItem = makeWeapon({ userId: 'outro-user', isPublic: false });
    await itemsRepository.create(privateItem);

    const result = await sut.execute({
      itemId: privateItem.id.toString(),
      userId: 'user-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
