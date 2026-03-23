import { EquipPowerArrayUseCase } from './equip-power-array';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { CharacterPowerArray } from '../../enterprise/entities/character-power-array';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: EquipPowerArrayUseCase;

describe('Equip Power Array', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new EquipPowerArrayUseCase(inMemoryCharactersRepository);
  });

  it('should be able to equip a power array', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const array = CharacterPowerArray.create({
      powerArrayId: 'array-1',
      isEquipped: false,
      finalPdaCost: 20,
      slotCost: 4,
    });
    character.powerArrays.add(array);
    
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerArrayId: 'array-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powerArrays.getItems()[0].isEquipped).toBe(true);
      expect(result.value.character.slots.usedSlots).toBe(4);
    }
  });
});
