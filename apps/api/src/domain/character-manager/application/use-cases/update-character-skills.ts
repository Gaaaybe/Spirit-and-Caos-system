import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { SkillName, ProficiencyState } from '../../enterprise/entities/value-objects/skills-manager';

interface UpdateCharacterSkillsUseCaseRequest {
  characterId: string;
  userId: string;
  skillName: SkillName;
  proficiencyState: ProficiencyState;
  trainingBonusIncrease?: number;
}

type UpdateCharacterSkillsUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class UpdateCharacterSkillsUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    skillName,
    proficiencyState,
    trainingBonusIncrease = 0,
  }: UpdateCharacterSkillsUseCaseRequest): Promise<UpdateCharacterSkillsUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    character.updateSkills(skillName, proficiencyState, trainingBonusIncrease);

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
