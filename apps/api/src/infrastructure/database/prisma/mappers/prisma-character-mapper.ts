import type { Prisma, DeathState as PrismaDeathState, SpiritualStage as PrismaSpiritualStage, DomainMasteryLevel as PrismaDomainMasteryLevel } from '@prisma/client';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';
import { Character } from '@/domain/character-manager/enterprise/entities/character';
import { CharacterBenefit } from '@/domain/character-manager/enterprise/entities/character-benefit';
import { CharacterPowerArray } from '@/domain/character-manager/enterprise/entities/character-power-array';
import { CharacterPower } from '@/domain/character-manager/enterprise/entities/character-power';
import { AttributeSet, type MentalAttribute, type PhysicalAttribute } from '@/domain/character-manager/enterprise/entities/value-objects/attribute-set';
import { Attribute } from '@/domain/character-manager/enterprise/entities/value-objects/attribute';
import { ConditionManager, type ConditionName } from '@/domain/character-manager/enterprise/entities/value-objects/condition-manager';
import { DeathManager, type DeathState } from '@/domain/character-manager/enterprise/entities/value-objects/death-manager';
import { type MasteryLevel, DomainMastery, } from '@/domain/character-manager/enterprise/entities/value-objects/domain-mastery';
import { EnergyManager } from '@/domain/character-manager/enterprise/entities/value-objects/energy-manager';
import { EquipmentSlots, type EquippedItem } from '@/domain/character-manager/enterprise/entities/value-objects/equipment-slots';
import { HealthManager } from '@/domain/character-manager/enterprise/entities/value-objects/health-manager';
import { Inventory, type InventoryItem } from '@/domain/character-manager/enterprise/entities/value-objects/inventory';
import { NarrativeProfile } from '@/domain/character-manager/enterprise/entities/value-objects/narrative-profile';
import { PdAManager } from '@/domain/character-manager/enterprise/entities/value-objects/pda-manager';
import { type SkillEntry, type SkillName, SkillsManager } from '@/domain/character-manager/enterprise/entities/value-objects/skills-manager';
import { SlotManager } from '@/domain/character-manager/enterprise/entities/value-objects/slot-manager';
import { SpiritualPrinciple, type SpiritualStage } from '@/domain/character-manager/enterprise/entities/value-objects/spiritual-principle';
import { CharacterBenefitList } from '@/domain/character-manager/enterprise/entities/watched-lists/character-benefit-list';
import { CharacterPowerArrayList } from '@/domain/character-manager/enterprise/entities/watched-lists/character-power-array-list';
import { CharacterPowerList } from '@/domain/character-manager/enterprise/entities/watched-lists/character-power-list';

export type PrismaCharacterFull = Prisma.CharacterGetPayload<{
  include: { powers: true; powerArrays: true; benefits: true; domains: true };
}>;

type AttributeJson = {
  baseValue: number;
  extraBonus?: number;
};

type AttributesJson = {
  strength: AttributeJson;
  dexterity: AttributeJson;
  constitution: AttributeJson;
  intelligence: AttributeJson;
  wisdom: AttributeJson;
  charisma: AttributeJson;
  keyPhysical: PhysicalAttribute;
  keyMental: MentalAttribute;
};

type SkillsJson = Record<string, SkillEntry>;

type PdaStateJson = {
  extraPda: number;
  spentPda: number;
};

type HealthStateJson = {
  currentPV: number;
  temporaryPV: number;
};

type EnergyStateJson = {
  currentPE: number;
  temporaryPE: number;
};

type SpiritualPrincipleJson = {
  isUnlocked: boolean;
  stage: SpiritualStage;
};

type EquippedItemJson = {
  itemId: string;
  quantity: number;
};

type EquipmentSlotsJson = {
  suitId?: string;
  accessoryId?: string;
  hands: EquippedItemJson[];
  quickAccess: EquippedItemJson[];
  numberOfHands: number;
};

type InventoryJson = {
  runics: number;
  bag: InventoryItem[];
};

type NarrativeJson = {
  identity: string;
  origin: string;
  motivations: string[];
  complications: string[];
};

const DEATH_STATE_TO_PRISMA: Record<DeathState, PrismaDeathState> = {
  ALIVE: 'ALIVE',
  DYING: 'DYING',
  DEAD: 'DEAD',
};

const DEATH_STATE_TO_DOMAIN: Record<PrismaDeathState, DeathState> = {
  ALIVE: 'ALIVE',
  DYING: 'DYING',
  DEAD: 'DEAD',
};

const SPIRITUAL_STAGE_TO_PRISMA: Record<SpiritualStage, PrismaSpiritualStage> = {
  NORMAL: 'NORMAL',
  DIVINE: 'DIVINE',
};

const SPIRITUAL_STAGE_TO_DOMAIN: Record<PrismaSpiritualStage, SpiritualStage> = {
  NORMAL: 'NORMAL',
  DIVINE: 'DIVINE',
};

const DOMAIN_MASTERY_TO_PRISMA: Record<MasteryLevel, PrismaDomainMasteryLevel> = {
  INICIANTE: 'INICIANTE',
  PRATICANTE: 'PRATICANTE',
  MESTRE: 'MESTRE',
};

const DOMAIN_MASTERY_TO_DOMAIN: Record<PrismaDomainMasteryLevel, MasteryLevel> = {
  INICIANTE: 'INICIANTE',
  PRATICANTE: 'PRATICANTE',
  MESTRE: 'MESTRE',
};

function asJson<T>(value: Prisma.JsonValue): T {
  return value as T;
}

function toEquippedItems(items: EquippedItemJson[]): EquippedItem[] {
  return items.map((item) => ({ itemId: item.itemId, quantity: item.quantity }));
}

export function toDomain(raw: PrismaCharacterFull): Character {
  const attributesRaw = asJson<AttributesJson>(raw.attributes);
  const narrativeRaw = asJson<NarrativeJson>(raw.narrativeProfile);
  const skillsRaw = asJson<SkillsJson>(raw.skills);
  const pdaRaw = asJson<PdaStateJson>(raw.pdaState);
  const healthRaw = asJson<HealthStateJson>(raw.healthState);
  const energyRaw = asJson<EnergyStateJson>(raw.energyState);
  const spiritualRaw = asJson<SpiritualPrincipleJson>(raw.spiritualPrinciple);
  const equipmentRaw = asJson<EquipmentSlotsJson>(raw.equipmentSlots);
  const inventoryRaw = asJson<InventoryJson>(raw.inventory);
  const conditionsRaw = asJson<ConditionName[]>(raw.conditions);

  const attributes = AttributeSet.create({
    strength: Attribute.create(attributesRaw.strength),
    dexterity: Attribute.create(attributesRaw.dexterity),
    constitution: Attribute.create(attributesRaw.constitution),
    intelligence: Attribute.create(attributesRaw.intelligence),
    wisdom: Attribute.create(attributesRaw.wisdom),
    charisma: Attribute.create(attributesRaw.charisma),
    keyPhysical: attributesRaw.keyPhysical,
    keyMental: attributesRaw.keyMental,
  });

  const skillsEntries = new Map<SkillName, SkillEntry>();
  for (const [skillName, entry] of Object.entries(skillsRaw)) {
    skillsEntries.set(skillName as SkillName, entry);
  }

  const powersList = new CharacterPowerList();
  const sortedPowers = [...raw.powers].sort((a, b) => a.posicao - b.posicao);
  powersList.update(
    sortedPowers.map((power) =>
      CharacterPower.create(
        {
          powerId: power.powerId,
          isEquipped: power.isEquipped,
          finalPdaCost: power.finalPdaCost,
          slotCost: power.slotCost,
        },
        new UniqueEntityId(power.id),
      ),
    ),
  );

  const powerArraysList = new CharacterPowerArrayList();
  const sortedPowerArrays = [...raw.powerArrays].sort((a, b) => a.posicao - b.posicao);
  powerArraysList.update(
    sortedPowerArrays.map((powerArray) =>
      CharacterPowerArray.create(
        {
          powerArrayId: powerArray.powerArrayId,
          isEquipped: powerArray.isEquipped,
          finalPdaCost: powerArray.finalPdaCost,
          slotCost: powerArray.slotCost,
        },
        new UniqueEntityId(powerArray.id),
      ),
    ),
  );

  const benefitsList = new CharacterBenefitList();
  const sortedBenefits = [...raw.benefits].sort((a, b) => a.posicao - b.posicao);
  benefitsList.update(
    sortedBenefits.map((benefit) =>
      CharacterBenefit.create(
        {
          name: benefit.name,
          degree: benefit.degree,
          pdaCost: benefit.pdaCost,
        },
        new UniqueEntityId(benefit.id),
      ),
    ),
  );

  return Character.create(
    {
      userId: new UniqueEntityId(raw.userId),
      level: raw.level,
      inspiration: raw.inspiration,
      narrativeProfile: NarrativeProfile.create(narrativeRaw),
      attributes,
      skills: SkillsManager.create({ entries: skillsEntries }),
      spiritualPrinciple: SpiritualPrinciple.create({
        isUnlocked: spiritualRaw.isUnlocked,
        stage: SPIRITUAL_STAGE_TO_DOMAIN[spiritualRaw.stage as PrismaSpiritualStage],
      }),
      domainMasteries: raw.domains.map((domain) =>
        DomainMastery.create({
          domainId: domain.domainId,
          masteryLevel: DOMAIN_MASTERY_TO_DOMAIN[domain.masteryLevel],
        }),
      ),
      pda: PdAManager.create({
        level: raw.level,
        extraPda: pdaRaw.extraPda,
        spentPda: pdaRaw.spentPda,
      }),
      health: HealthManager.create({
        level: raw.level,
        constitutionModifier: attributes.constitution.rollModifier,
        currentPV: healthRaw.currentPV,
        temporaryPV: healthRaw.temporaryPV,
      }),
      energy: EnergyManager.create({
        keyPhysicalModifier: attributes[attributes.keyPhysical].rollModifier,
        keyMentalModifier: attributes[attributes.keyMental].rollModifier,
        currentPE: energyRaw.currentPE,
        temporaryPE: energyRaw.temporaryPE,
      }),
      slots: SlotManager.create({
        intelligenceModifier: attributes.intelligence.rollModifier,
        usedSlots:
          sortedPowers.filter((power) => power.isEquipped).reduce((sum, power) => sum + power.slotCost, 0) +
          sortedPowerArrays
            .filter((powerArray) => powerArray.isEquipped)
            .reduce((sum, powerArray) => sum + powerArray.slotCost, 0),
      }),
      conditions: ConditionManager.create(conditionsRaw),
      deathManager: DeathManager.create({
        state: DEATH_STATE_TO_DOMAIN[raw.deathState],
        deathCounter: raw.deathCounter,
      }),
      inventory: Inventory.create({
        runics: inventoryRaw.runics,
        bag: inventoryRaw.bag,
      }),
      equipment: EquipmentSlots.create({
        suitId: equipmentRaw.suitId,
        accessoryId: equipmentRaw.accessoryId,
        hands: toEquippedItems(equipmentRaw.hands),
        quickAccess: toEquippedItems(equipmentRaw.quickAccess),
        numberOfHands: equipmentRaw.numberOfHands,
      }),
      powers: powersList,
      powerArrays: powerArraysList,
      benefits: benefitsList,
      symbol: raw.symbol ?? undefined,
      art: raw.art ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    },
    new UniqueEntityId(raw.id),
  );
}

export function toPrisma(character: Character): Prisma.CharacterUncheckedCreateInput {
  const skillsJson: SkillsJson = {};
  for (const [skillName, entry] of character.skills.entries.entries()) {
    skillsJson[skillName] = entry;
  }

  return {
    id: character.id.toString(),
    userId: character.userId.toString(),
    level: character.level,
    inspiration: character.inspiration,
    attributes: {
      strength: {
        baseValue: character.attributes.strength.baseValue,
        extraBonus: character.attributes.strength.extraBonus,
      },
      dexterity: {
        baseValue: character.attributes.dexterity.baseValue,
        extraBonus: character.attributes.dexterity.extraBonus,
      },
      constitution: {
        baseValue: character.attributes.constitution.baseValue,
        extraBonus: character.attributes.constitution.extraBonus,
      },
      intelligence: {
        baseValue: character.attributes.intelligence.baseValue,
        extraBonus: character.attributes.intelligence.extraBonus,
      },
      wisdom: {
        baseValue: character.attributes.wisdom.baseValue,
        extraBonus: character.attributes.wisdom.extraBonus,
      },
      charisma: {
        baseValue: character.attributes.charisma.baseValue,
        extraBonus: character.attributes.charisma.extraBonus,
      },
      keyPhysical: character.attributes.keyPhysical,
      keyMental: character.attributes.keyMental,
    },
    narrativeProfile: {
      identity: character.narrative.identity,
      origin: character.narrative.origin,
      motivations: character.narrative.motivations,
      complications: character.narrative.complications,
    },
    skills: skillsJson as unknown as Prisma.InputJsonValue,
    pdaState: {
      extraPda: character.pda.extraPda,
      spentPda: character.pda.spentPda,
    },
    healthState: {
      currentPV: character.health.currentPV,
      temporaryPV: character.health.temporaryPV,
    },
    energyState: {
      currentPE: character.energy.currentPE,
      temporaryPE: character.energy.temporaryPE,
    },
    spiritualPrinciple: {
      isUnlocked: character.spiritualPrinciple.isUnlocked,
      stage: SPIRITUAL_STAGE_TO_PRISMA[character.spiritualPrinciple.stage],
    },
    equipmentSlots: {
      suitId: character.equipment.suitId,
      accessoryId: character.equipment.accessoryId,
      hands: character.equipment.hands,
      quickAccess: character.equipment.quickAccess,
      numberOfHands: character.equipment.numberOfHands,
    } as unknown as Prisma.InputJsonValue,
    inventory: {
      runics: character.inventory.runics,
      bag: character.inventory.bag,
    } as unknown as Prisma.InputJsonValue,
    conditions: character.conditions.activeConditions,
    deathState: DEATH_STATE_TO_PRISMA[character.deathManager.state],
    deathCounter: character.deathManager.deathCounter,
    symbol: character.symbol ?? null,
    art: character.art ?? null,
    createdAt: character.createdAt,
    updatedAt: character.updatedAt ?? undefined,
    powers: {
      create: character.powers.getItems().map((power, index) => ({
        id: power.id.toString(),
        powerId: power.powerId,
        isEquipped: power.isEquipped,
        finalPdaCost: power.finalPdaCost,
        slotCost: power.slotCost,
        posicao: index,
      })),
    },
    powerArrays: {
      create: character.powerArrays.getItems().map((powerArray, index) => ({
        id: powerArray.id.toString(),
        powerArrayId: powerArray.powerArrayId,
        isEquipped: powerArray.isEquipped,
        finalPdaCost: powerArray.finalPdaCost,
        slotCost: powerArray.slotCost,
        posicao: index,
      })),
    },
    benefits: {
      create: character.benefits.getItems().map((benefit, index) => ({
        id: benefit.id.toString(),
        name: benefit.name,
        degree: benefit.degree,
        pdaCost: benefit.pdaCost,
        posicao: index,
      })),
    },
    domains: {
      create: character.domainMasteries.map((domain) => ({
        domainId: domain.domainId,
        masteryLevel: DOMAIN_MASTERY_TO_PRISMA[domain.masteryLevel],
      })),
    },
  };
}
