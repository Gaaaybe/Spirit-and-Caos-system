import { TakeDamageUseCase } from './take-damage';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: TakeDamageUseCase;

describe('Take Damage', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new TakeDamageUseCase(inMemoryCharactersRepository);
  });

  it('should be able to take damage and fall unconscious if PV <= 0', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);

    const initialHealth = character.health.maxPV;

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      amount: initialHealth + 1,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.health.currentPV).toBe(0);
      expect(result.value.character.deathManager.state).toBe('DYING');
    }
  });
});
