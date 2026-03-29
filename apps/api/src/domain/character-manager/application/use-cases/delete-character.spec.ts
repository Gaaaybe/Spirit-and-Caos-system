import { DeleteCharacterUseCase } from './delete-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { NotAllowedError } from './errors/not-allowed-error';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: DeleteCharacterUseCase;

describe('Delete Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new DeleteCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to delete a character', async () => {
    const newCharacter = makeCharacter(
      { userId: new UniqueEntityId('user-1') },
      new UniqueEntityId('character-1'),
    );

    inMemoryCharactersRepository.items.push(newCharacter);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: 'user-1',
    });

    expect(result.isRight()).toBe(true);
    expect(inMemoryCharactersRepository.items).toHaveLength(0);
  });

  it('should not be able to delete a character from another user', async () => {
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

  it('should not be able to delete a non-existing character', async () => {
    const result = await sut.execute({
      characterId: 'non-existing-character',
      userId: 'user-1',
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
