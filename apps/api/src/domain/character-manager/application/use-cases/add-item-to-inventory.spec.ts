import { AddItemToInventoryUseCase } from './add-item-to-inventory';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { InMemoryItemsLookupPort } from '../../../../../test/repositories/in-memory-items-lookup-port';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let inMemoryItemsLookupPort: InMemoryItemsLookupPort;
let sut: AddItemToInventoryUseCase;

describe('Add Item To Inventory', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    inMemoryItemsLookupPort = new InMemoryItemsLookupPort();
    sut = new AddItemToInventoryUseCase(
      inMemoryCharactersRepository,
      inMemoryItemsLookupPort,
    );
  });

  it('should be able to add an item to the inventory', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    inMemoryItemsLookupPort.items.push({ id: new UniqueEntityId('item-1') });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      quantity: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.inventory.bag).toHaveLength(1);
      expect(result.value.character.inventory.bag[0].itemId).toBe('instance-item-1-character-1');
      expect(result.value.character.inventory.bag[0].quantity).toBe(2);
    }
  });

  it('should not be able to add a non-existing item', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'non-existing-item',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not be able to add an item to another user character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);
    inMemoryItemsLookupPort.items.push({ id: new UniqueEntityId('item-1') });

    const result = await sut.execute({
      characterId: 'character-1',
      userId: 'wrong-user-id',
      itemId: 'item-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
