import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { InMemoryPowerArraysLookupPort } from '@test/repositories/in-memory-power-arrays-lookup-port';
import { InMemoryPowersLookupPort } from '@test/repositories/in-memory-powers-lookup-port';
import { beforeEach, describe, expect, it } from 'vitest';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { ItemType } from '../../enterprise/entities/item';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { UpdateItemUseCase } from './update-item';

describe('UpdateItemUseCase', () => {
  let sut: UpdateItemUseCase;
  let itemsRepository: InMemoryItemsRepository;
  let powersLookupPort: InMemoryPowersLookupPort;
  let powerArraysLookupPort: InMemoryPowerArraysLookupPort;
  const userId = 'user-1';

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    powersLookupPort = new InMemoryPowersLookupPort();
    powerArraysLookupPort = new InMemoryPowerArraysLookupPort();
    sut = new UpdateItemUseCase(itemsRepository, powersLookupPort, powerArraysLookupPort);
  });

  function makeWeapon(ownerId: string) {
    return Weapon.create({
      userId: ownerId,
      nome: 'Espada Longa',
      descricao: 'Uma espada de corte bem equilibrada para combate',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.CORPO_A_CORPO,
    });
  }

  it('should update a weapon nome', async () => {
    const weapon = makeWeapon(userId);
    await itemsRepository.create(weapon);

    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      itemId: weapon.id.toString(),
      userId,
      nome: 'Espada Élfica',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.nome).toBe('Espada Élfica');
      expect(itemsRepository.items[0].nome).toBe('Espada Élfica');
    }
  });

  it('should make item public on update', async () => {
    const weapon = makeWeapon(userId);
    await itemsRepository.create(weapon);

    await sut.execute({
      tipo: ItemType.WEAPON,
      itemId: weapon.id.toString(),
      userId,
      isPublic: true,
    });

    expect(itemsRepository.items[0].isPublic).toBe(true);
  });

  it('should return ResourceNotFoundError if item does not exist', async () => {
    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      itemId: 'inexistente',
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return NotAllowedError if user does not own the item', async () => {
    const weapon = makeWeapon('outro-user');
    await itemsRepository.create(weapon);

    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      itemId: weapon.id.toString(),
      userId,
      nome: 'Nome Novo',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });

  it('should return NotAllowedError when tipo does not match existing item', async () => {
    const weapon = makeWeapon(userId);
    await itemsRepository.create(weapon);

    const result = await sut.execute({
      tipo: ItemType.CONSUMABLE,
      itemId: weapon.id.toString(),
      userId,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
