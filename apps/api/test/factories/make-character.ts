import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Character, CharacterProps } from '@/domain/character-manager/enterprise/entities/character';
import { NarrativeProfile } from '@/domain/character-manager/enterprise/entities/value-objects/narrative-profile';
import { AttributeSet } from '@/domain/character-manager/enterprise/entities/value-objects/attribute-set';
import { Attribute } from '@/domain/character-manager/enterprise/entities/value-objects/attribute';
import { SkillsManager } from '@/domain/character-manager/enterprise/entities/value-objects/skills-manager';
import { SpiritualPrinciple } from '@/domain/character-manager/enterprise/entities/value-objects/spiritual-principle';
import { PdAManager } from '@/domain/character-manager/enterprise/entities/value-objects/pda-manager';
import { HealthManager } from '@/domain/character-manager/enterprise/entities/value-objects/health-manager';
import { EnergyManager } from '@/domain/character-manager/enterprise/entities/value-objects/energy-manager';
import { SlotManager } from '@/domain/character-manager/enterprise/entities/value-objects/slot-manager';
import { ConditionManager } from '@/domain/character-manager/enterprise/entities/value-objects/condition-manager';
import { DeathManager } from '@/domain/character-manager/enterprise/entities/value-objects/death-manager';
import { Inventory } from '@/domain/character-manager/enterprise/entities/value-objects/inventory';
import { EquipmentSlots } from '@/domain/character-manager/enterprise/entities/value-objects/equipment-slots';
import { CharacterPowerList } from '@/domain/character-manager/enterprise/entities/watched-lists/character-power-list';
import { CharacterPowerArrayList } from '@/domain/character-manager/enterprise/entities/watched-lists/character-power-array-list';
import { CharacterBenefitList } from '@/domain/character-manager/enterprise/entities/watched-lists/character-benefit-list';

export function makeCharacter(
  override: Partial<CharacterProps> = {},
  id?: UniqueEntityId,
) {
  const level = override.level ?? 1;

  const narrativeProfile = override.narrativeProfile ?? NarrativeProfile.create({
    identity: 'Hero',
    origin: 'Unknown',
    motivations: ['Justice'],
    complications: ['Enemies'],
  });

  const attributes = override.attributes ?? AttributeSet.create({
    strength: Attribute.create({ baseValue: 10 }),
    dexterity: Attribute.create({ baseValue: 10 }),
    constitution: Attribute.create({ baseValue: 14 }),
    intelligence: Attribute.create({ baseValue: 10 }),
    wisdom: Attribute.create({ baseValue: 10 }),
    charisma: Attribute.create({ baseValue: 10 }),
    keyPhysical: 'strength',
    keyMental: 'intelligence',
  });

  const character = Character.create(
    {
      userId: new UniqueEntityId(),
      level,
      inspiration: 0,
      narrativeProfile,
      attributes,
      skills: override.skills ?? SkillsManager.createInitial(),
      spiritualPrinciple: override.spiritualPrinciple ?? SpiritualPrinciple.create({ isUnlocked: true, stage: 'NORMAL' }),
      domainMasteries: override.domainMasteries ?? [],
      pda: override.pda ?? PdAManager.create({ level, extraPda: 0 }),
      health: override.health ?? HealthManager.create({ level, constitutionModifier: attributes.constitution.rollModifier }),
      energy: override.energy ?? EnergyManager.create({
        keyPhysicalModifier: attributes.strength.rollModifier,
        keyMentalModifier: attributes.intelligence.rollModifier,
      }),
      slots: override.slots ?? SlotManager.create({ intelligenceModifier: attributes.intelligence.rollModifier }),
      conditions: override.conditions ?? ConditionManager.create([]),
      deathManager: override.deathManager ?? DeathManager.create(),
      inventory: override.inventory ?? Inventory.create({ runics: 0, bag: [] }),
      equipment: override.equipment ?? EquipmentSlots.create({ hands: [], quickAccess: [], numberOfHands: 2 }),
      powers: override.powers ?? new CharacterPowerList(),
      powerArrays: override.powerArrays ?? new CharacterPowerArrayList(),
      benefits: override.benefits ?? new CharacterBenefitList(),
      ...override,
    },
    id,
  );

  return character;
}
