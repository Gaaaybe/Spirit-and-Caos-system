import { RemoveFromInventoryUseCase } from './remove-from-inventory';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: RemoveFromInventoryUseCase;

describe('Remove From Inventory', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new RemoveFromInventoryUseCase(inMemoryCharactersRepository);
  });

  it('should be able to remove an item from the inventory', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.addToInventory('item-1', 5);
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      quantity: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.inventory.bag[0].quantity).toBe(3);
    }
  });
});
