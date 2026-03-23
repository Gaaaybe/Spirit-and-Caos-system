import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from './errors/not-allowed-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { NarrativeProfile } from '../../enterprise/entities/value-objects/narrative-profile';
import { AttributeSet, type MentalAttribute, type PhysicalAttribute } from '../../enterprise/entities/value-objects/attribute-set';
import { Attribute } from '../../enterprise/entities/value-objects/attribute';
import type { ProficiencyState, SkillName } from '../../enterprise/entities/value-objects/skills-manager';
import type { ConditionName } from '../../enterprise/entities/value-objects/condition-manager';

interface SyncCharacterUseCaseRequest {
  characterId: string;
  userId: string;
  narrative?: {
    identity: string;
    origin: string;
    motivations: string[];
    complications: string[];
  };
  symbol?: string | null;
  art?: string | null;
  inspiration?: number;
  pvChange?: number;
  peChange?: number;
  attributes?: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    keyPhysical: PhysicalAttribute;
    keyMental: MentalAttribute;
  };
  skills?: {
    name: SkillName;
    state: ProficiencyState;
    trainingBonusIncrease?: number;
  }[];
  conditions?: ConditionName[];
}

type SyncCharacterUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    character: Character;
  }
>;

@Injectable()
export class SyncCharacterUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute({
    characterId,
    userId,
    narrative,
    symbol,
    art,
    inspiration,
    pvChange,
    peChange,
    attributes,
    skills,
    conditions,
  }: SyncCharacterUseCaseRequest): Promise<SyncCharacterUseCaseResponse> {
    const character = await this.charactersRepository.findById(characterId);

    if (!character) {
      return left(new ResourceNotFoundError());
    }

    if (userId !== character.userId.toString()) {
      return left(new NotAllowedError());
    }

    if (narrative) {
      const newNarrative = NarrativeProfile.create(narrative);
      character.updateNarrative(newNarrative);
    }

    if (symbol !== undefined) {
      character.updateSymbol(symbol);
    }

    if (art !== undefined) {
      character.updateArt(art);
    }

    if (inspiration !== undefined) {
      character.updateInspiration(inspiration);
    }

    if (pvChange !== undefined || peChange !== undefined) {
      character.applyRestResult(pvChange ?? 0, peChange ?? 0);
    }

    if (attributes) {
      const newAttributes = AttributeSet.create({
        strength: Attribute.create({ baseValue: attributes.strength }),
        dexterity: Attribute.create({ baseValue: attributes.dexterity }),
        constitution: Attribute.create({ baseValue: attributes.constitution }),
        intelligence: Attribute.create({ baseValue: attributes.intelligence }),
        wisdom: Attribute.create({ baseValue: attributes.wisdom }),
        charisma: Attribute.create({ baseValue: attributes.charisma }),
        keyPhysical: attributes.keyPhysical,
        keyMental: attributes.keyMental,
      });
      character.updateAttributes(newAttributes);
    }

    if (skills) {
      for (const skillUpdate of skills) {
        character.updateSkills(
          skillUpdate.name,
          skillUpdate.state,
          skillUpdate.trainingBonusIncrease,
        );
      }
    }

    if (conditions) {
      character.updateConditions(conditions);
    }

    await this.charactersRepository.save(character);

    return right({
      character,
    });
  }
}
