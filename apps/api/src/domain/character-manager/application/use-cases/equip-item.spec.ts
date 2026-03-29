import { EquipItemUseCase } from './equip-item';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { InMemoryItemsLookupPort } from '../../../../../test/repositories/in-memory-items-lookup-port';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryItemsLookupPort: InMemoryItemsLookupPort;
let sut: EquipItemUseCase;

describe('Equip Item', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryItemsLookupPort = new InMemoryItemsLookupPort();
    sut = new EquipItemUseCase(
      inMemoryCharactersRepository,
      inMemoryItemsLookupPort,
    );
  });

  it('should be able to equip an item from inventory to a slot', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.addToInventory('item-1', 1);

    inMemoryCharactersRepository.items.push(character);
    inMemoryItemsLookupPort.items.push({ id: new UniqueEntityId('item-1') });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      slot: 'hand',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.equipment.hands).toEqual(
        expect.arrayContaining([expect.objectContaining({ itemId: 'item-1', quantity: 1 })])
      );

      const inBag = result.value.character.inventory.bag.find(i => i.itemId === 'item-1');
      expect(inBag).toBeUndefined();
    }
  });

  it('should not be able to equip an item not in inventory', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);
    inMemoryItemsLookupPort.items.push({ id: new UniqueEntityId('item-1') });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      slot: 'hand',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });
});
