import { Injectable } from '@nestjs/common';
import { Either, left, right } from '@/core/either';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { CharactersRepository } from '../repositories/characters-repository';
import { Character } from '../../enterprise/entities/character';
import { NarrativeProfile } from '../../enterprise/entities/value-objects/narrative-profile';
import { AttributeSet } from '../../enterprise/entities/value-objects/attribute-set';
import { Attribute } from '../../enterprise/entities/value-objects/attribute';
import { SkillsManager } from '../../enterprise/entities/value-objects/skills-manager';
import { SpiritualPrinciple } from '../../enterprise/entities/value-objects/spiritual-principle';
import { PdAManager } from '../../enterprise/entities/value-objects/pda-manager';
import { HealthManager } from '../../enterprise/entities/value-objects/health-manager';
import { EnergyManager } from '../../enterprise/entities/value-objects/energy-manager';
import { SlotManager } from '../../enterprise/entities/value-objects/slot-manager';
import { ConditionManager } from '../../enterprise/entities/value-objects/condition-manager';
import { DeathManager } from '../../enterprise/entities/value-objects/death-manager';
import { Inventory } from '../../enterprise/entities/value-objects/inventory';
import { EquipmentSlots } from '../../enterprise/entities/value-objects/equipment-slots';
import { CharacterPowerList } from '../../enterprise/entities/watched-lists/character-power-list';
import { CharacterPowerArrayList } from '../../enterprise/entities/watched-lists/character-power-array-list';
import { CharacterBenefitList } from '../../enterprise/entities/watched-lists/character-benefit-list';

interface CreateCharacterUseCaseRequest {
  userId: string;
  narrative: {
    identity: string;
    origin: string;
    motivations: string[];
    complications: string[];
  };
  attributes: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    keyPhysical: 'strength' | 'dexterity' | 'constitution';
    keyMental: 'intelligence' | 'wisdom' | 'charisma';
  };
  spiritualPrinciple: {
    isUnlocked: boolean;
  };
}

type CreateCharacterUseCaseResponse = Either<
  DomainValidationError,
  {
    character: Character;
  }
>;

@Injectable()
export class CreateCharacterUseCase {
  constructor(private charactersRepository: CharactersRepository) {}

  async execute(request: CreateCharacterUseCaseRequest): Promise<CreateCharacterUseCaseResponse> {
    const narrativeProfile = NarrativeProfile.create(request.narrative);

    const attributes = AttributeSet.create({
        strength: Attribute.create({ baseValue: request.attributes.strength }),
        dexterity: Attribute.create({ baseValue: request.attributes.dexterity }),
        constitution: Attribute.create({ baseValue: request.attributes.constitution }),
        intelligence: Attribute.create({ baseValue: request.attributes.intelligence }),
        wisdom: Attribute.create({ baseValue: request.attributes.wisdom }),
        charisma: Attribute.create({ baseValue: request.attributes.charisma }),
        keyPhysical: request.attributes.keyPhysical,
        keyMental: request.attributes.keyMental,
      });

      const skills = SkillsManager.createInitial();
      
      const spiritualPrinciple = SpiritualPrinciple.create({
        isUnlocked: request.spiritualPrinciple.isUnlocked,
        stage: 'NORMAL',
      });

      const extraPda = request.spiritualPrinciple.isUnlocked ? 0 : 15;

      const pda = PdAManager.create({ level: 1, extraPda });
      
      const health = HealthManager.create({ 
        level: 1, 
        constitutionModifier: attributes.constitution.rollModifier 
      });

      const energy = EnergyManager.create({
        keyPhysicalModifier: attributes[request.attributes.keyPhysical].rollModifier,
        keyMentalModifier: attributes[request.attributes.keyMental].rollModifier,
      });

      const slots = SlotManager.create({
        intelligenceModifier: attributes.intelligence.rollModifier,
      });

      const conditions = ConditionManager.create([]);
      const deathManager = DeathManager.create();
      
      const inventory = Inventory.create({ runics: 0, bag: [] });
      const equipment = EquipmentSlots.create({ hands: [], quickAccess: [], numberOfHands: 2 });

      const character = Character.create({
      userId: new UniqueEntityId(request.userId),
      level: 1,
      inspiration: 0,
      narrativeProfile,
      attributes,
      skills,
      spiritualPrinciple,
      domainMasteries: [],
      pda,
      health,
      energy,
      slots,
      conditions,
      deathManager,
      inventory,
      equipment,
      powers: new CharacterPowerList(),
      powerArrays: new CharacterPowerArrayList(),
      benefits: new CharacterBenefitList(),
    });

    await this.charactersRepository.create(character);

    return right({ character });
  }
}
