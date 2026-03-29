import { UnequipPowerUseCase } from './unequip-power';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { CharacterPower } from '../../enterprise/entities/character-power';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: UnequipPowerUseCase;

describe('Unequip Power', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new UnequipPowerUseCase(inMemoryCharactersRepository);
  });

  it('should be able to unequip a power', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    const power = CharacterPower.create({
      powerId: 'power-1',
      isEquipped: true,
      finalPdaCost: 10,
      slotCost: 2,
    });
    character.powers.add(power);
    character.equipPower('power-1');
    
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      powerId: 'power-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.powers.getItems()[0].isEquipped).toBe(false);
      expect(result.value.character.slots.usedSlots).toBe(0);
    }
  });
});
