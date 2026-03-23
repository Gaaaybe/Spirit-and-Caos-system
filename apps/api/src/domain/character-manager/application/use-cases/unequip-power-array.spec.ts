import { UnequipPowerArrayUseCase } from './unequip-power-array';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { CharacterPowerArray } from '../../enterprise/entities/character-power-array';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: UnequipPowerArrayUseCase;

describe('Unequip Power Array', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new UnequipPowerArrayUseCase(inMemoryCharactersRepository);
  });

  it('should be able to unequip a power array', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const array = CharacterPowerArray.create({
      powerArrayId: 'array-1',
      isEquipped: true,
      finalPdaCost: 20,
      slotCost: 4,
    });
    character.powerArrays.add(array);
    character.equipPowerArray('array-1');
    
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerArrayId: 'array-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powerArrays.getItems()[0].isEquipped).toBe(false);
      expect(result.value.character.slots.usedSlots).toBe(0);
    }
  });
});
