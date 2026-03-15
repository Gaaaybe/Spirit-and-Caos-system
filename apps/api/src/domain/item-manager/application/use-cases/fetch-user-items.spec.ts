import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { Consumable, SpoilageState } from '../../enterprise/entities/consumable';
import { ItemType } from '../../enterprise/entities/item';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { FetchUserItemsUseCase } from './fetch-user-items';

describe('FetchUserItemsUseCase', () => {
  let sut: FetchUserItemsUseCase;
  let itemsRepository: InMemoryItemsRepository;
  const userId = 'user-1';

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    sut = new FetchUserItemsUseCase(itemsRepository);
  });

  it('should fetch items belonging to a user', async () => {
    const weapon = Weapon.create({
      userId,
      nome: 'Espada Longa',
      descricao: 'Uma espada bem equilibrada de corte',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
    });

    const otherWeapon = Weapon.create({
      userId: 'outro-user',
      nome: 'Machado',
      descricao: 'Um machado de guerra pesado e destruidor',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 15,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d10', 'corte', false)],
      critMargin: 3,
      critMultiplier: 3,
      alcance: WeaponRange.NATURAL,
    });

    await itemsRepository.create(weapon);
    await itemsRepository.create(otherWeapon);

    const result = await sut.execute({ userId, page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].userId).toBe(userId);
    }
  });

  it('should filter by item type', async () => {
    const weapon = Weapon.create({
      userId,
      nome: 'Espada Longa',
      descricao: 'Uma espada bem equilibrada de corte',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
    });

    const consumable = Consumable.create({
      userId,
      nome: 'Poção de Cura',
      descricao: 'Uma poção que restaura pontos de vida ao ser consumida',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      custoBase: 5,
      nivelItem: 1,
      descritorEfeito: 'cura',
      qtdDoses: 3,
      isRefeicao: false,
    });

    await itemsRepository.create(weapon);
    await itemsRepository.create(consumable);

    const result = await sut.execute({ userId, page: 1, tipo: ItemType.CONSUMABLE });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].tipo).toBe(ItemType.CONSUMABLE);
    }
  });

  it('should return empty list when user has no items', async () => {
    const result = await sut.execute({ userId, page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(0);
    }
  });
});
