import { RemoveConditionUseCase } from './remove-condition';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: RemoveConditionUseCase;

describe('Remove Condition', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new RemoveConditionUseCase(inMemoryCharactersRepository);
  });

  it('should be able to remove a condition from a character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.applyCondition('Atordoado');
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      condition: 'Atordoado',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.conditions.activeConditions).not.toContain('Atordoado');
    }
  });
});
