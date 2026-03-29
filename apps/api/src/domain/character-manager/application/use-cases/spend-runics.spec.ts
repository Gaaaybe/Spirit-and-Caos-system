import { SpendRunicsUseCase } from './spend-runics';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: SpendRunicsUseCase;

describe('Spend Runics', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new SpendRunicsUseCase(inMemoryCharactersRepository);
  });

  it('should be able to spend runics from a character', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.addRunics(100);
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      amount: 40,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.inventory.runics).toBe(60);
    }
  });

  it('should fail if character does not have enough runics', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      amount: 100,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });
});
