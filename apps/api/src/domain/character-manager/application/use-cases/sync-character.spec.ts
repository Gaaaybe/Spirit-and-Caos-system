import { SyncCharacterUseCase } from './sync-character';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: SyncCharacterUseCase;

describe('Sync Character', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new SyncCharacterUseCase(inMemoryCharactersRepository);
  });

  it('should be able to sync character free text properties', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      narrative: {
        identity: 'New Identity',
        origin: 'New Origin',
        motivations: ['Money'],
        complications: ['Greed'],
      },
      symbol: 'http://new-symbol.png',
      art: 'http://new-art.png',
      inspiration: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.narrative.identity).toBe('New Identity');
      expect(result.value.character.symbol).toBe('http://new-symbol.png');
      expect(result.value.character.art).toBe('http://new-art.png');
      expect(result.value.character.inspiration).toBe(2);
    }
  });

  it('should be able to sync only specific properties', async () => {
    const character = makeCharacter(
      { inspiration: 1 },
      new UniqueEntityId('character-1'),
    );
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      inspiration: 3,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.inspiration).toBe(3);
      expect(result.value.character.narrative.identity).toBe('Hero');
    }
  });

  it('should be able to sync health and energy changes', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      pvChange: -2,
      peChange: -1,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.health.currentPV).toBe(character.health.maxPV - 2);
      expect(result.value.character.energy.currentPE).toBe(character.energy.maxPE - 1);
    }
  });

  it('should be able to sync attributes', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      attributes: {
        strength: 15,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        keyPhysical: 'strength',
        keyMental: 'wisdom',
      },
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.attributes.strength.baseValue).toBe(15);
    }
  });

  it('should be able to sync skills', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      skills: [
        { name: 'Acrobacia', state: 'EFFICIENT', trainingBonusIncrease: 2 },
      ],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.skills.getSkill('Acrobacia').proficiencyState).toBe('EFFICIENT');
      expect(result.value.character.skills.getSkill('Acrobacia').trainingBonus).toBe(2);
    }
  });

  it('should be able to sync conditions', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      conditions: ['Abalado', 'Caído'],
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.character.conditions.activeConditions).toContain('Abalado');
      expect(result.value.character.conditions.activeConditions).toContain('Caído');
    }
  });
});
