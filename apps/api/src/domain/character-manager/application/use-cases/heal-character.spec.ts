import { HealCharacterUseCase } from './heal-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: HealCharacterUseCase;

describe('Heal Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new HealCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to heal a character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.takeDamage(5);

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      amount: 3,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.health.currentPV).toBe(character.health.maxPV - 2);
    }
  });

  it('should stabilize character if healed above 0 PV', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.takeDamage(character.health.maxPV + 5);

    inMemoryCharactersRepository.items.push(character);

    expect(character.deathManager.state).toBe('DYING');

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      amount: 1,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.health.currentPV).toBe(1);
      expect(result.value.character.deathManager.state).toBe('ALIVE');
    }
  });
});
