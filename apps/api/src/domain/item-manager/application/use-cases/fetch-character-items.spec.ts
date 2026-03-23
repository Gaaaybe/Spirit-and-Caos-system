import { FetchCharacterItemsUseCase } from './fetch-character-items';
import { InMemoryItemsRepository } from '../../../../../test/repositories/in-memory-items-repository';
import { makeWeapon } from '../../../../../test/factories/make-weapon';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryItemsRepository: InMemoryItemsRepository;
let sut: FetchCharacterItemsUseCase;

describe('Fetch Character Items', () => {
  beforeEach(() => {
    inMemoryItemsRepository = new InMemoryItemsRepository();
    sut = new FetchCharacterItemsUseCase(inMemoryItemsRepository);
  });

  it('should be able to fetch items for a specific character', async () => {
    const characterId = 'character-1';
    
    const item1 = makeWeapon({ characterId }, new UniqueEntityId('item-1'));
    const item2 = makeWeapon({ characterId }, new UniqueEntityId('item-2'));
    const item3 = makeWeapon({ characterId: 'other-character' }, new UniqueEntityId('item-3'));

    await inMemoryItemsRepository.create(item1);
    await inMemoryItemsRepository.create(item2);
    await inMemoryItemsRepository.create(item3);

    const result = await sut.execute({ characterId });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.items).toHaveLength(2);
      expect(result.value.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: new UniqueEntityId('item-1') }),
          expect.objectContaining({ id: new UniqueEntityId('item-2') }),
        ]),
      );
    }
  });
});
