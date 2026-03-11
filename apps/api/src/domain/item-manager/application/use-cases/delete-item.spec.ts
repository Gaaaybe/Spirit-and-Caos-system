import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { ItemType } from '../../enterprise/entities/item';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { DeleteItemUseCase } from './delete-item';

describe('DeleteItemUseCase', () => {
  let sut: DeleteItemUseCase;
  let itemsRepository: InMemoryItemsRepository;
  const userId = 'user-1';

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    sut = new DeleteItemUseCase(itemsRepository);
  });

  function makeWeapon(ownerId?: string) {
    return Weapon.create({
      userId: ownerId,
      nome: 'Espada Longa',
      descricao: 'Uma espada de corte bem equilibrada',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.CORPO_A_CORPO,
    });
  }

  it('should delete an item owned by the user', async () => {
    const weapon = makeWeapon(userId);
    await itemsRepository.create(weapon);

    expect(itemsRepository.items).toHaveLength(1);

    const result = await sut.execute({ itemId: weapon.id.toString(), userId });

    expect(result.isRight()).toBe(true);
    expect(itemsRepository.items).toHaveLength(0);
  });

  it('should return ResourceNotFoundError if item does not exist', async () => {
    const result = await sut.execute({ itemId: 'inexistente', userId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError if user does not own the item', async () => {
    const weapon = makeWeapon('outro-user');
    await itemsRepository.create(weapon);

    const result = await sut.execute({ itemId: weapon.id.toString(), userId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should not delete official items', async () => {
    const official = makeWeapon(undefined); // userId = undefined → oficial
    await itemsRepository.create(official);

    const result = await sut.execute({ itemId: official.id.toString(), userId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should not affect other items when deleting', async () => {
    const weapon1 = makeWeapon(userId);
    const weapon2 = makeWeapon(userId);
    await itemsRepository.create(weapon1);
    await itemsRepository.create(weapon2);

    await sut.execute({ itemId: weapon1.id.toString(), userId });

    expect(itemsRepository.items).toHaveLength(1);
    expect(itemsRepository.items[0].id.equals(weapon2.id)).toBe(true);
  });
});
