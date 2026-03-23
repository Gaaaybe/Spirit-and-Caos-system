import { CreateCharacterUseCase } from './create-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { DomainValidationError } from '@/core/errors/domain-validation-error';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: CreateCharacterUseCase;

describe('Create Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new CreateCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to create a character', async () => {
    const result = await sut.execute({
      userId: 'user-1',
      narrative: {
        identity: 'Knight',
        origin: 'Capital',
        motivations: ['Justice'],
        complications: ['Honor bound'],
      },
      attributes: {
        strength: 16,
        dexterity: 14,
        constitution: 14,
        intelligence: 10,
        wisdom: 10,
        charisma: 12,
        keyPhysical: 'strength',
        keyMental: 'charisma',
      },
      spiritualPrinciple: {
        isUnlocked: false,
      },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.id).toBeTruthy();
      expect(result.value.character.userId.toString()).toBe('user-1');
      expect(result.value.character.pda.totalPda).toBe(30);
      expect(result.value.character.health.maxPV).toBe(8);
      expect(result.value.character.energy.maxPE).toBe(14);
      expect(inMemoryCharactersRepository.items).toHaveLength(1);
    }
  });

  it('should not be able to create a character with invalid narrative (less than 2 entries)', async () => {
    await expect(() =>
      sut.execute({
        userId: 'user-1',
        narrative: {
          identity: 'Knight',
          origin: 'Capital',
          motivations: ['Justice'],
          complications: [],
        },
        attributes: {
          strength: 16,
          dexterity: 14,
          constitution: 14,
          intelligence: 10,
          wisdom: 10,
          charisma: 12,
          keyPhysical: 'strength',
          keyMental: 'charisma',
        },
        spiritualPrinciple: {
          isUnlocked: false,
        },
      }),
    ).rejects.toBeInstanceOf(DomainValidationError);
  });
});
