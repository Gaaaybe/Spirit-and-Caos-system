import { ConsumeEnergyUseCase } from './consume-energy';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: ConsumeEnergyUseCase;

describe('Consume Energy', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new ConsumeEnergyUseCase(inMemoryCharactersRepository);
  });

  it('should be able to consume energy', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      amount: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.energy.currentPE).toBe(character.energy.maxPE - 2);
    }
  });
});
