import { UpgradeItemUseCase } from './upgrade-item';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { InMemoryItemsLookupPort } from '../../../../../test/repositories/in-memory-items-lookup-port';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryItemsLookupPort: InMemoryItemsLookupPort;
let sut: UpgradeItemUseCase;

describe('Upgrade Item', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryItemsLookupPort = new InMemoryItemsLookupPort();
    sut = new UpgradeItemUseCase(
      inMemoryCharactersRepository,
      inMemoryItemsLookupPort,
    );
  });

  it('should be able to upgrade an item', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.addRunics(1000);

    character.addToInventory('item-1', 1);
    character.addToInventory('material-1', 1);

    inMemoryCharactersRepository.items.push(character);
    
    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('item-1'),
      characterId: 'character-1',
      tipo: 'WEAPON',
      upgradeLevel: {
        value: 0,
        maxLevel: 7,
        getMultiplier: () => 1
      }
    });

    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('material-1'),
      tipo: 'UPGRADE_MATERIAL',
      tier: 1,
      maxUpgradeLimit: 2
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      materialId: 'material-1',
      runicsCost: 500,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.inventory.runics).toBe(500);
      
      const materialInBag = result.value.character.inventory.bag.find(i => i.itemId === 'material-1');
      expect(materialInBag).toBeUndefined();

      const upgradedItem = inMemoryItemsLookupPort.items.find(i => i.id.toString() === 'item-1');
      expect(upgradedItem?.upgradeLevel.value).toBe(1);
    }
  });

  it('should not be able to upgrade an item if max level is reached', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.addRunics(1000);
    character.addToInventory('item-1', 1);
    character.addToInventory('material-1', 1);

    inMemoryCharactersRepository.items.push(character);
    
    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('item-1'),
      characterId: 'character-1',
      tipo: 'WEAPON',
      upgradeLevel: {
        value: 7,
        maxLevel: 7,
        getMultiplier: () => 128
      }
    });

    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('material-1'),
      tipo: 'UPGRADE_MATERIAL',
      tier: 4,
      maxUpgradeLimit: 7
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      materialId: 'material-1',
      runicsCost: 500,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });

  it('should not be able to upgrade if material tier is too low', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.addRunics(1000);
    character.addToInventory('item-1', 1);
    character.addToInventory('material-1', 1);

    inMemoryCharactersRepository.items.push(character);
    
    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('item-1'),
      characterId: 'character-1',
      tipo: 'WEAPON',
      upgradeLevel: {
        value: 2,
        maxLevel: 7,
        getMultiplier: () => 4
      }
    });

    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('material-1'),
      tipo: 'UPGRADE_MATERIAL',
      tier: 1,
      maxUpgradeLimit: 2
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      materialId: 'material-1',
      runicsCost: 500,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });

  it('should not be able to upgrade without enough runics', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.addToInventory('item-1', 1);
    character.addToInventory('material-1', 1);

    inMemoryCharactersRepository.items.push(character);
    
    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('item-1'),
      characterId: 'character-1',
      tipo: 'WEAPON',
      upgradeLevel: {
        value: 0,
        maxLevel: 7,
        getMultiplier: () => 1
      }
    });

    inMemoryItemsLookupPort.items.push({
      id: new UniqueEntityId('material-1'),
      tipo: 'UPGRADE_MATERIAL',
      tier: 1,
      maxUpgradeLimit: 2
    });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      materialId: 'material-1',
      runicsCost: 500,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });
});
