import { UnequipItemUseCase } from './unequip-item';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: UnequipItemUseCase;

describe('Unequip Item', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new UnequipItemUseCase(inMemoryCharactersRepository);
  });

  it('should be able to unequip an item and return it to inventory', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.addToInventory('item-1', 1);
    character.equipItem('item-1', 'hand');

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'item-1',
      slot: 'hand',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.equipment.hands.find(h => h.itemId === 'item-1')).toBeUndefined();
      const inBag = result.value.character.inventory.bag.find(i => i.itemId === 'item-1');
      expect(inBag).toBeDefined();
      expect(inBag?.quantity).toBe(1);
    }
  });

  it('should be able to unequip a suit and return it to inventory', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.addToInventory('suit-1', 1);
    character.equipItem('suit-1', 'suit');

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      itemId: 'suit-1',
      slot: 'suit',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.equipment.suitId).toBeUndefined();
      const inBag = result.value.character.inventory.bag.find(i => i.itemId === 'suit-1');
      expect(inBag).toBeDefined();
      expect(inBag?.quantity).toBe(1);
    }
  });
});
