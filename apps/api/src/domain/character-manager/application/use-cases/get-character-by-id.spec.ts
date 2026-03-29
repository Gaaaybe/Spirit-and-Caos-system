import { GetCharacterByIdUseCase } from './get-character-by-id';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: GetCharacterByIdUseCase;

describe('Get Character By Id', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new GetCharacterByIdUseCase(inMemoryCharactersRepository);
  });

  it('should be able to get a character by id', async () => {
    const newCharacter = makeCharacter({}, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(newCharacter);

    const result = await sut.execute({
      characterId: 'character-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.id.toString()).toBe('character-1');
    }
  });

  it('should not be able to get a non-existing character', async () => {
    const result = await sut.execute({
      characterId: 'non-existing-character',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
