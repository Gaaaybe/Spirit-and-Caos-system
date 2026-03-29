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
import { DomainValidationError } from '@/core/errors/domain-validation-error';

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
  level?: number;
  extraPda?: number;
  pvChange?: number;
  peChange?: number;
  tempPvChange?: number;
  tempPeChange?: number;
  attributes?: {
    strength: { baseValue: number; extraBonus?: number };
    dexterity: { baseValue: number; extraBonus?: number };
    constitution: { baseValue: number; extraBonus?: number };
    intelligence: { baseValue: number; extraBonus?: number };
    wisdom: { baseValue: number; extraBonus?: number };
    charisma: { baseValue: number; extraBonus?: number };
    keyPhysical: PhysicalAttribute;
    keyMental: MentalAttribute;
  };
  skills?: {
    name: SkillName;
    state: ProficiencyState;
    trainingBonus?: number;
    extraBonus?: number;
  }[];
  conditions?: ConditionName[];
}

type SyncCharacterUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError | DomainValidationError,
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
    level,
    extraPda,
    pvChange,
    peChange,
    tempPvChange,
    tempPeChange,
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

    if (level !== undefined) {
      try {
        character.changeLevel(level);
      } catch (e) {
        if (e instanceof DomainValidationError) return left(e);
        throw e;
      }
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

    if (extraPda !== undefined) {
      character.updateExtraPda(extraPda);
    }

    if (pvChange !== undefined || peChange !== undefined) {
      character.applyRestResult(pvChange ?? 0, peChange ?? 0);
    }

    if (tempPvChange !== undefined && tempPvChange > 0) {
      character.addTemporaryPV(tempPvChange);
    }

    if (tempPeChange !== undefined && tempPeChange > 0) {
      character.addTemporaryPE(tempPeChange);
    }

    if (attributes) {
      const newAttributes = AttributeSet.create({
        strength: Attribute.create(attributes.strength),
        dexterity: Attribute.create(attributes.dexterity),
        constitution: Attribute.create(attributes.constitution),
        intelligence: Attribute.create(attributes.intelligence),
        wisdom: Attribute.create(attributes.wisdom),
        charisma: Attribute.create(attributes.charisma),
        keyPhysical: attributes.keyPhysical,
        keyMental: attributes.keyMental,
      });

      // Validação de limite de pontos por nível
      // Progressão triangular: 67 + (nivel * (nivel - 1) / 2)
      const allowedPoints = 67 + (character.level * (character.level - 1)) / 2;
      const spentPoints = newAttributes.totalBasePoints;

      if (spentPoints > allowedPoints) {
        return left(
          new DomainValidationError(
            `Limite de atributos excedido. Gasto: ${spentPoints}, Máximo permitido para nível ${character.level}: ${allowedPoints}`,
            'attributes',
          ),
        );
      }

      character.updateAttributes(newAttributes);
    }

    if (skills) {
      for (const skillUpdate of skills) {
        character.updateSkill(
          skillUpdate.name,
          skillUpdate.state,
          skillUpdate.trainingBonus ?? 0,
          skillUpdate.extraBonus ?? 0,
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
