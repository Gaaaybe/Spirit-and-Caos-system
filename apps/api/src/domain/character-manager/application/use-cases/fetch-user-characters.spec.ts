import { FetchUserCharactersUseCase } from './fetch-user-characters';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: FetchUserCharactersUseCase;

describe('Fetch User Characters', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new FetchUserCharactersUseCase(inMemoryCharactersRepository);
  });

  it('should be able to fetch user characters', async () => {
    inMemoryCharactersRepository.items.push(
      makeCharacter({ userId: new UniqueEntityId('user-1') }),
    );
    inMemoryCharactersRepository.items.push(
      makeCharacter({ userId: new UniqueEntityId('user-1') }),
    );
    inMemoryCharactersRepository.items.push(
      makeCharacter({ userId: new UniqueEntityId('user-2') }),
    );

    const result = await sut.execute({
      userId: 'user-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.characters).toHaveLength(2);
      expect(result.value.characters[0].userId.toString()).toBe('user-1');
    }
  });

  it('should return an empty array if user has no characters', async () => {
    const result = await sut.execute({
      userId: 'user-1',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.characters).toHaveLength(0);
    }
  });
});
