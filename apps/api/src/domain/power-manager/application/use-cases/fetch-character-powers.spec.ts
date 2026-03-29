import { FetchCharacterPowersUseCase } from './fetch-character-powers';
import { InMemoryPowersRepository } from '../../../../../test/repositories/in-memory-powers-repository';
import { makePower } from '../../../../../test/factories/make-power';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryPowersRepository: InMemoryPowersRepository;
let sut: FetchCharacterPowersUseCase;

describe('Fetch Character Powers', () => {
  beforeEach(() => {
    inMemoryPowersRepository = new InMemoryPowersRepository();
    sut = new FetchCharacterPowersUseCase(inMemoryPowersRepository);
  });

  it('should be able to fetch powers for a specific character', async () => {
    const characterId = 'character-1';
    
    const power1 = makePower({ characterId }, new UniqueEntityId('power-1'));
    const power2 = makePower({ characterId }, new UniqueEntityId('power-2'));
    const power3 = makePower({ characterId: 'other-character' }, new UniqueEntityId('power-3'));

    await inMemoryPowersRepository.create(power1);
    await inMemoryPowersRepository.create(power2);
    await inMemoryPowersRepository.create(power3);

    const result = await sut.execute({ characterId });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powers).toHaveLength(2);
      expect(result.value.powers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: new UniqueEntityId('power-1') }),
          expect.objectContaining({ id: new UniqueEntityId('power-2') }),
        ]),
      );
    }
  });
});
