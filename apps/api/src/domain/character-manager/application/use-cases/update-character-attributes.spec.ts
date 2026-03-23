import { UpdateCharacterAttributesUseCase } from './update-character-attributes';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: UpdateCharacterAttributesUseCase;

describe('Update Character Attributes', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new UpdateCharacterAttributesUseCase(inMemoryCharactersRepository);
  });

  it('should be able to update character attributes and recalculate derived stats', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const oldHealth = character.health.maxPV;
    const oldEnergy = character.energy.maxPE;
    const oldSlots = character.slots.maxSlots;

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      attributes: {
        strength: 20,
        dexterity: 10,
        constitution: 20,
        intelligence: 20,
        wisdom: 10,
        charisma: 10,
        keyPhysical: 'strength',
        keyMental: 'intelligence',
      },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.attributes.constitution.baseValue).toBe(20);
      expect(result.value.character.health.maxPV).toBeGreaterThan(oldHealth);
      expect(result.value.character.energy.maxPE).toBeGreaterThan(oldEnergy);
      expect(result.value.character.slots.maxSlots).toBeGreaterThan(oldSlots);
    }
  });
});
