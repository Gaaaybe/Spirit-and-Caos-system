import { LevelUpCharacterUseCase } from './level-up-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { NotAllowedError } from './errors/not-allowed-error';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: LevelUpCharacterUseCase;

describe('Level Up Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new LevelUpCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to level up a character', async () => {
    const newCharacter = makeCharacter(
      { level: 1 },
      new UniqueEntityId('character-1'),
    );
    inMemoryCharactersRepository.items.push(newCharacter);

    const oldPda = newCharacter.pda.totalPda;
    const oldHealth = newCharacter.health.maxPV;

    const result = await sut.execute({
      characterId: 'character-1',
      userId: newCharacter.userId.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.level).toBe(2);
      expect(result.value.character.pda.totalPda).toBeGreaterThan(oldPda);
      expect(result.value.character.health.maxPV).toBeGreaterThan(oldHealth);
      expect(inMemoryCharactersRepository.items[0].level).toBe(2);
    }
  });

  it('should not be able to level up a character from another user', async () => {
    const newCharacter = makeCharacter(
      { userId: new UniqueEntityId('user-1') },
      new UniqueEntityId('character-1'),
    );
    inMemoryCharactersRepository.items.push(newCharacter);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: 'user-2',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotAllowedError);
  });
});
