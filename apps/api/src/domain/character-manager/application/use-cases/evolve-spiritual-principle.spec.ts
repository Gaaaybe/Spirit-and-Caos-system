import { EvolveSpiritualPrincipleUseCase } from './evolve-spiritual-principle';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { SpiritualPrinciple } from '../../enterprise/entities/value-objects/spiritual-principle';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: EvolveSpiritualPrincipleUseCase;

describe('Evolve Spiritual Principle', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new EvolveSpiritualPrincipleUseCase(inMemoryCharactersRepository);
  });

  it('should be able to evolve spiritual principle to divine stage', async () => {
    const character = makeCharacter({
      level: 35,
      spiritualPrinciple: SpiritualPrinciple.create({ isUnlocked: true, stage: 'NORMAL' }),
    }, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.spiritualPrinciple.stage).toBe('DIVINE');
    }
  });

  it('should not be able to evolve if level is below 35', async () => {
    const character = makeCharacter({
      level: 34,
      spiritualPrinciple: SpiritualPrinciple.create({ isUnlocked: true, stage: 'NORMAL' }),
    }, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });

  it('should not be able to evolve if it is not unlocked yet', async () => {
    const character = makeCharacter({
      level: 40,
      spiritualPrinciple: SpiritualPrinciple.create({ isUnlocked: false, stage: 'NORMAL' }),
    }, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });

  it('should not be able to evolve if already divine', async () => {
    const character = makeCharacter({
      level: 40,
      spiritualPrinciple: SpiritualPrinciple.create({ isUnlocked: true, stage: 'DIVINE' }),
    }, new UniqueEntityId('character-1'));

    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(DomainValidationError);
  });
});
