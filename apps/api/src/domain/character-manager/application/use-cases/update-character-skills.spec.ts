import { UpdateCharacterSkillsUseCase } from './update-character-skills';
import { InMemoryCharactersRepository } from '../../../../../test/repositories/in-memory-characters-repository';
import { makeCharacter } from '../../../../../test/factories/make-character';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

let inMemoryCharactersRepository: InMemoryCharactersRepository;
let sut: UpdateCharacterSkillsUseCase;

describe('Update Character Skills', () => {
  beforeEach(() => {
    inMemoryCharactersRepository = new InMemoryCharactersRepository();
    sut = new UpdateCharacterSkillsUseCase(inMemoryCharactersRepository);
  });

  it('should be able to update character skill proficiency and training bonus', async () => {
    const character = makeCharacter({}, new UniqueEntityId('character-1'));
    inMemoryCharactersRepository.items.push(character);

    const result = await sut.execute({
      characterId: 'character-1',
      userId: character.userId.toString(),
      skillName: 'Acrobacia',
      proficiencyState: 'EFFICIENT',
      trainingBonusIncrease: 2,
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      const skill = result.value.character.skills.getSkill('Acrobacia');
      expect(skill.proficiencyState).toBe('EFFICIENT');
      expect(skill.trainingBonus).toBe(2);
    }
  });
});
