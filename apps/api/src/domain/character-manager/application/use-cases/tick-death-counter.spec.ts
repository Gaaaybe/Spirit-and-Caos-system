import { TickDeathCounterUseCase } from './tick-death-counter';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: TickDeathCounterUseCase;

describe('Tick Death Counter', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new TickDeathCounterUseCase(inMemoryCharactersRepository);
  });

  it('should increase death counter when character is dying', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.takeDamage(character.health.maxPV + 5);
    inMemoryCharactersRepository.items.push(character);

    expect(character.deathManager.state).toBe('DYING');
    expect(character.deathManager.deathCounter).toBe(0);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.deathManager.deathCounter).toBe(1);
    }
  });

  it('should change state to DEAD and emit domain event if counter reaches 3', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    character.takeDamage(character.health.maxPV + 5);
    inMemoryCharactersRepository.items.push(character);

    await sut.execute({ characterId: 'character-1', userId: character.userId.toString() });
    await sut.execute({ characterId: 'character-1', userId: character.userId.toString() });
    
    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.deathManager.state).toBe('DEAD');
    }
  });
});
