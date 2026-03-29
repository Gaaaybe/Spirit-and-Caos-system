import { UnlockSpiritualPrincipleUseCase } from './unlock-spiritual-principle';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { SpiritualPrinciple } from '../../enterprise/entities/value-objects/spiritual-principle';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: UnlockSpiritualPrincipleUseCase;

describe('Unlock Spiritual Principle', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new UnlockSpiritualPrincipleUseCase(inMemoryCharactersRepository);
  });

  it('should be able to unlock spiritual principle for a character without powers', async () => {
    const character = makeCharacter(
      {
        spiritualPrinciple: SpiritualPrinciple.create({
          isUnlocked: false,
          stage: 'NORMAL',
        }),
      },
      new UniqueEntityId('character-1'),
    );

    character.pda.updateLevel(1);
    character.pda.refund(15);
    
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.spiritualPrinciple.isUnlocked).toBe(true);
      expect(result.value.character.spiritualPrinciple.stage).toBe('NORMAL');
    }
  });

  it('should not be able to unlock an already unlocked spiritual principle', async () => {
    const character = makeCharacter(
      {
        spiritualPrinciple: SpiritualPrinciple.create({
          isUnlocked: true,
          stage: 'NORMAL',
        }),
      },
      new UniqueEntityId('character-1'),
    );
    
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });

  it('should fail if character does not have enough PdA to pay for the unlock', async () => {
    const character = makeCharacter(
      {
        spiritualPrinciple: SpiritualPrinciple.create({
          isUnlocked: false,
          stage: 'NORMAL',
        }),
      },
      new UniqueEntityId('character-1'),
    );
    
    character.spendPda(character.pda.availablePda);

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });
});
