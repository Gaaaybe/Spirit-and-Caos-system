import { RestUseCase } from './rest';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { RestService } from '../../enterprise/services/rest-service';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let restService: RestService;
let sut: RestUseCase;

describe('Rest', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    restService = new RestService();
    sut = new RestUseCase(inMemoryCharactersRepository, restService);
  });

  it('should be able to recover PV and PE after a normal rest', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Force high rolls

    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.takeDamage(5);
    character.consumeEnergy(2);
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      quality: 'NORMAL',
      durationHours: 8,
      hasCare: false,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.pvChange).toBeGreaterThan(0);
      expect(result.value.peChange).toBeGreaterThan(0);
    }

    vi.restoreAllMocks();
  });

  it('should lose PV and PE if injured and resting in bad conditions', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    character.applyCondition('Lesão');
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      quality: 'RUIM',
      durationHours: 8,
      hasCare: false,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.pvChange).toBeLessThan(0);
      expect(result.value.peChange).toBeLessThan(0);
    }
  });
});
