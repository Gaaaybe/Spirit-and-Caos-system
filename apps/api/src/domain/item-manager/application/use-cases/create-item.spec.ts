import { InMemoryItemsRepository } from '@test/repositories/in-memory-items-repository';
import { InMemoryPowerArraysLookupPort } from '@test/repositories/in-memory-power-arrays-lookup-port';
import { InMemoryPowersLookupPort } from '@test/repositories/in-memory-powers-lookup-port';
import { beforeEach, describe, expect, it } from 'vitest';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Domain, DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { ItemType } from '../../enterprise/entities/item';
import { Weapon, WeaponRange } from '../../enterprise/entities/weapon';
import { Consumable } from '../../enterprise/entities/consumable';
import { Artifact } from '../../enterprise/entities/artifact';
import { Accessory } from '../../enterprise/entities/accessory';
import { DefensiveEquipment, EquipmentType } from '../../enterprise/entities/defensive-equipment';
import { DamageDescriptor } from '../../enterprise/entities/value-objects/damage-descriptor';
import { CreateItemUseCase } from './create-item';
import { InvalidItemDomainError } from './errors/invalid-item-domain-error';

describe('CreateItemUseCase', () => {
  let sut: CreateItemUseCase;
  let itemsRepository: InMemoryItemsRepository;
  let powersLookupPort: InMemoryPowersLookupPort;
  let powerArraysLookupPort: InMemoryPowerArraysLookupPort;

  beforeEach(() => {
    itemsRepository = new InMemoryItemsRepository();
    powersLookupPort = new InMemoryPowersLookupPort();
    powerArraysLookupPort = new InMemoryPowerArraysLookupPort();
    sut = new CreateItemUseCase(itemsRepository, powersLookupPort, powerArraysLookupPort);
  });

  it('should create a weapon', async () => {
    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Espada Longa',
      descricao: 'Uma espada de corte bem equilibrada para combate',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.tipo).toBe(ItemType.WEAPON);
      expect(result.value.item.nome).toBe('Espada Longa');
      expect(result.value.item.isOfficial()).toBe(false);
      expect(itemsRepository.items).toHaveLength(1);
    }
  });

  it('should create a weapon with multiple damage types', async () => {
    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Espada de Fogo',
      descricao: 'Uma lâmina que corta e queima com chamas arcanas devastadoras',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 20,
      nivelItem: 2,
      danos: [
        DamageDescriptor.create('1d8', 'corte', false),
        DamageDescriptor.create('1d8', 'fogo', false),
      ],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const weapon = result.value.item as Weapon;
      expect(weapon.danos).toHaveLength(2);
      expect(weapon.danos[0].base).toBe('corte');
      expect(weapon.danos[1].base).toBe('fogo');
    }
  });

  it('should create an official weapon without userId', async () => {
    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      nome: 'Espada Padrão',
      descricao: 'A espada padrão de combate do sistema oficial do jogo',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 8,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d6', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.isOfficial()).toBe(true);
    }
  });

  it('should create a consumable refeição with SpoilageState', async () => {
    const result = await sut.execute({
      tipo: ItemType.CONSUMABLE,
      userId: 'user-1',
      nome: 'Ensopado de Frango',
      descricao: 'Um ensopado nutritivo que restaura energia durante o descanso',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      custoBase: 3,
      nivelItem: 1,
      descritorEfeito: 'nutrição',
      qtdDoses: 1,
      isRefeicao: true,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const consumable = result.value.item as Consumable;
      expect(consumable.isRefeicao).toBe(true);
      expect(consumable.spoilageState).toBeDefined();
    }
  });

  it('should create an artifact', async () => {
    const result = await sut.execute({
      tipo: ItemType.ARTIFACT,
      userId: 'user-1',
      nome: 'Amuleto Ancestral',
      descricao: 'Um amuleto com poderes místicos antigos de uma era esquecida',
      dominio: Domain.create({ name: DomainName.SAGRADO }),
      custoBase: 50,
      nivelItem: 3,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const artifact = result.value.item as Artifact;
      expect(artifact.isAttuned).toBe(false);
    }
  });

  it('should create a defensive equipment', async () => {
    const result = await sut.execute({
      tipo: ItemType.DEFENSIVE_EQUIPMENT,
      userId: 'user-1',
      nome: 'Armadura de Couro',
      descricao: 'Uma armadura leve de couro curtido para combate ágil',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      custoBase: 15,
      nivelItem: 1,
      tipoEquipamento: EquipmentType.TRAJE,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const armor = result.value.item as DefensiveEquipment;
      expect(armor.baseRD).toBe(2);
      expect(armor.rdAtual).toBe(2);
    }
  });

  it('should create an accessory', async () => {
    const result = await sut.execute({
      tipo: ItemType.ACCESSORY,
      userId: 'user-1',
      nome: 'Anel da Velocidade',
      descricao: 'Um anel encantado que aumenta a agilidade do portador',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      custoBase: 30,
      nivelItem: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.tipo).toBe(ItemType.ACCESSORY);
    }
  });

  it('should associate powers with matching domain', async () => {
    powersLookupPort.powers.push({
      id: 'power-1',
      nome: 'Fio Cortante',
      domainName: DomainName.ARMA_BRANCA,
      itemLevelContribution: 3,
    });

    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Espada Precisa',
      descricao: 'Uma espada forjada para ataques precisos e letais',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 20,
      nivelItem: 2,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 3,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      powerIds: ['power-1'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.powerIds.getItems()).toHaveLength(1);
    }
  });

  it('should return InvalidItemDomainError if power domain does not match item domain', async () => {
    powersLookupPort.powers.push({
      id: 'power-sagrado',
      nome: 'Chama Divina',
      domainName: DomainName.SAGRADO,
      itemLevelContribution: 2,
    });

    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Espada Simples',
      descricao: 'Uma espada simples sem nenhum encantamento especial',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      powerIds: ['power-sagrado'],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidItemDomainError);
  });

  it('should return ResourceNotFoundError if power does not exist', async () => {
    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Espada',
      descricao: 'Uma espada simples sem nenhum encantamento especial',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      nivelItem: 1,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      powerIds: ['power-inexistente'],
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should calculate item level from linked powers and power arrays', async () => {
    powersLookupPort.powers.push({
      id: 'power-1',
      nome: 'Fio Cortante',
      domainName: DomainName.ARMA_BRANCA,
      itemLevelContribution: 3,
    });

    powerArraysLookupPort.powerArrays.push({
      id: 'array-1',
      nome: 'Arsenal Cortante',
      domainName: DomainName.ARMA_BRANCA,
      itemLevelContribution: 5,
    });

    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Espada Mestra',
      descricao: 'Uma espada mestra que canaliza técnicas e estilos de combate avançados',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 10,
      danos: [DamageDescriptor.create('1d8', 'corte', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      powerIds: ['power-1'],
      powerArrayIds: ['array-1'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.nivelItem).toBe(8);
      expect(result.value.item.valorBase).toBe(80);
    }
  });

  it('should default item level to 1 when there are no linked powers', async () => {
    const result = await sut.execute({
      tipo: ItemType.ARTIFACT,
      userId: 'user-1',
      nome: 'Pedra Neutra',
      descricao: 'Uma pedra sem poderes vinculados usada para validar o nível automático',
      dominio: Domain.create({ name: DomainName.NATURAL }),
      custoBase: 4,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.item.nivelItem).toBe(1);
      expect(result.value.item.valorBase).toBe(4);
    }
  });

  it('should create a natural weapon with extra reach in meters', async () => {
    const result = await sut.execute({
      tipo: ItemType.WEAPON,
      userId: 'user-1',
      nome: 'Lanca Longa',
      descricao: 'Uma arma com alcance natural estendido em meio metro para manter distancia.',
      dominio: Domain.create({ name: DomainName.ARMA_BRANCA }),
      custoBase: 12,
      danos: [DamageDescriptor.create('1d8', 'perfuracao', false)],
      critMargin: 2,
      critMultiplier: 2,
      alcance: WeaponRange.NATURAL,
      alcanceExtraMetros: 0.5,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const weapon = result.value.item as Weapon;
      expect(weapon.alcance).toBe(WeaponRange.NATURAL);
      expect(weapon.alcanceExtraMetros).toBe(0.5);
    }
  });
});

