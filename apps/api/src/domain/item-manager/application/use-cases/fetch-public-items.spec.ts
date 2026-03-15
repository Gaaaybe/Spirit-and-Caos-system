import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { beforeEach, describe, expect, it } from 'vitest';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { ItemType } from '../../enterprise/entities/item';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import { Consumable } from '../../enterprise/entities/consumable';
import { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { FetchPublicItemsUseCase } from './fetch-public-items';

describe('FetchPublicItemsUseCase', () => {
  let sut: FetchPublicItemsUseCase;
  let itemsRepository: InMemoryItemsRepository;

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    sut = new FetchPublicItemsUseCase(itemsRepository);
  });

  it('should return official and public user items', async () => {
    // official item: no userId, no powers needed
    const official = Weapon.create({
      nome: 'Espada Padrão',
      descricao: 'A espada padrão de combate do sistema oficial',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d6', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
    });

    const publicWeapon = Weapon.create({
      userId: 'user-1',
      nome: 'Espada Élfica',
      descricao: 'Uma espada leve e afiada de origem élfica',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 15,
      nivelItem: 2,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 3,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      isPublic: true,
    });

    const privateWeapon = Weapon.create({
      userId: 'user-2',
      nome: 'Adaga Secreta',
      descricao: 'Uma adaga letal escondida nas sombras',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 8,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d4', 'perfuração', false)],
      critMargin: 3,
      critMultiplier: 3,
      alcance: WeaponRange.NATURAL,
      isPublic: false,
    });

    await itemsRepository.create(official);
    await itemsRepository.create(publicWeapon);
    await itemsRepository.create(privateWeapon);

    const result = await sut.execute({ page: 1 });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(2);
    }
  });

  it('should filter public items by type', async () => {
    const publicWeapon = Weapon.create({
      userId: 'user-1',
      nome: 'Espada Élfica',
      descricao: 'Uma espada leve e afiada de origem élfica',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 15,
      nivelItem: 2,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 3,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      isPublic: true,
    });

    const publicConsumable = Consumable.create({
      userId: 'user-1',
      nome: 'Poção Élfica',
      descricao: 'Uma poção de cura de origem élfica extremamente eficaz',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      custoBase: 10,
      nivelItem: 1,
      descritorEfeito: 'cura',
      qtdDoses: 5,
      isRefeicao: false,
      isPublic: true,
    });

    await itemsRepository.create(publicWeapon);
    await itemsRepository.create(publicConsumable);

    const result = await sut.execute({ page: 1, tipo: ItemType.WEAPON });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].tipo).toBe(ItemType.WEAPON);
    }
  });
});
