import { FetchCharacterPowerArraysUseCase } from './fetch-character-power-arrays';
import { InMemoryPowerArraysRepository } from '../../../../../test/repositories/in-memory-power-arrays-repository';
import { makePowerArray } from '../../../../../test/factories/make-power-array';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryPowerArraysRepository: InMemoryPowerArraysRepository;
let sut: FetchCharacterPowerArraysUseCase;

describe('Fetch Character Power Arrays', () => {
  beforeEach(() => {
    inMemoryPowerArraysRepository = new InMemoryPowerArraysRepository();
    sut = new FetchCharacterPowerArraysUseCase(inMemoryPowerArraysRepository);
  });

  it('should be able to fetch power arrays for a specific character', async () => {
    const characterId = 'character-1';
    
    const array1 = makePowerArray({ characterId }, new UniqueEntityId('array-1'));
    const array2 = makePowerArray({ characterId }, new UniqueEntityId('array-2'));
    const array3 = makePowerArray({ characterId: 'other-character' }, new UniqueEntityId('array-3'));

    await inMemoryPowerArraysRepository.create(array1);
    await inMemoryPowerArraysRepository.create(array2);
    await inMemoryPowerArraysRepository.create(array3);

    const result = await sut.execute({ characterId });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.powerArrays).toHaveLength(2);
      expect(result.value.powerArrays).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: new UniqueEntityId('array-1') }),
          expect.objectContaining({ id: new UniqueEntityId('array-2') }),
        ]),
      );
    }
  });
});
