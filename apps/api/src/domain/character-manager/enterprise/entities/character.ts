import { AggregateRoot } from '@/core/entities/aggregate-root';
import { UniqueEntityId } from '@/core/entities/unique-entity-ts';

import { AttributeSet } from './value-objects/attribute-set';
import { CombatStats } from './value-objects/combat-stats';
import { ConditionManager } from './value-objects/condition-manager';
import { DeathManager } from './value-objects/death-manager';
import { DomainMastery } from './value-objects/domain-mastery';
import { EnergyManager } from './value-objects/energy-manager';
import { EquipmentSlots } from './value-objects/equipment-slots';
import { HealthManager } from './value-objects/health-manager';
import { Inventory } from './value-objects/inventory';
import { NarrativeProfile } from './value-objects/narrative-profile';
import { PdAManager } from './value-objects/pda-manager';
import { SkillsManager } from './value-objects/skills-manager';
import { SlotManager } from './value-objects/slot-manager';
import { SpiritualPrinciple, SpiritualStage } from './value-objects/spiritual-principle';
import { DomainValidationError } from '@/core/errors/domain-validation-error';
import { MasteryLevel } from './value-objects/domain-mastery';
import { UnarmedMastery } from './value-objects/unarmed-mastery';

import { CharacterItemDiscardedEvent } from '../events/character-item-discarded-event';
import { CharacterPowerDiscardedEvent } from '../events/character-power-discarded-event';
import { CharacterPowerArrayDiscardedEvent } from '../events/character-power-array-discarded-event';
import { CharacterBenefitList } from './watched-lists/character-benefit-list';
import { CharacterPowerArrayList } from './watched-lists/character-power-array-list';
import { CharacterPowerList } from './watched-lists/character-power-list';

import { CharacterCreatedEvent } from '../events/character-created-event';
import { CharacterDiedEvent } from '../events/character-died-event';
import { CharacterLeveledUpEvent } from '../events/character-leveled-up-event';

export interface CharacterProps {
  userId: UniqueEntityId;
  level: number;
  inspiration: number;

  narrativeProfile: NarrativeProfile;
  attributes: AttributeSet;
  skills: SkillsManager;
  spiritualPrinciple: SpiritualPrinciple;
  domainMasteries: DomainMastery[];

  pda: PdAManager;
  health: HealthManager;
  energy: EnergyManager;
  slots: SlotManager;
  conditions: ConditionManager;
  deathManager: DeathManager;

  inventory: Inventory;
  equipment: EquipmentSlots;

  powers: CharacterPowerList;
  powerArrays: CharacterPowerArrayList;
  benefits: CharacterBenefitList;
  unarmedMastery: UnarmedMastery;

  symbol?: string;
  art?: string;

  createdAt: Date;
  updatedAt?: Date;
}

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export class Character extends AggregateRoot<CharacterProps> {
  static create(
    props: Optional<CharacterProps, 'createdAt' | 'unarmedMastery'>,
    id?: UniqueEntityId,
  ): Character {
    const isNew = !id;
    const character = new Character(
      {
        ...props,
        unarmedMastery: props.unarmedMastery ?? UnarmedMastery.createDefault(),
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    if (isNew) {
      character.addDomainEvent(new CharacterCreatedEvent(character));
    }

    return character;
  }

  get userId(): UniqueEntityId {
    return this.props.userId;
  }
  get level(): number {
    return this.props.level;
  }
  get inspiration(): number {
    return this.props.inspiration;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get symbol(): string | undefined {
    return this.props.symbol;
  }
  get art(): string | undefined {
    return this.props.art;
  }

  get hasInjury(): boolean {
    return this.conditions.hasEffectOf('Lesão');
  }

  get narrative(): NarrativeProfile {
    return this.props.narrativeProfile;
  }
  get attributes(): AttributeSet {
    return this.props.attributes;
  }
  get skills(): SkillsManager {
    return this.props.skills;
  }
  get spiritualPrinciple(): SpiritualPrinciple {
    return this.props.spiritualPrinciple;
  }
  get domainMasteries(): DomainMastery[] {
    return [...this.props.domainMasteries];
  }

  get pda(): PdAManager {
    return this.props.pda;
  }
  get health(): HealthManager {
    return this.props.health;
  }
  get energy(): EnergyManager {
    return this.props.energy;
  }
  get slots(): SlotManager {
    return this.props.slots;
  }
  get conditions(): ConditionManager {
    return this.props.conditions;
  }
  get deathManager(): DeathManager {
    return this.props.deathManager;
  }

  get inventory(): Inventory {
    return this.props.inventory;
  }
  get equipment(): EquipmentSlots {
    return this.props.equipment;
  }

  get powers(): CharacterPowerList {
    return this.props.powers;
  }
  get powerArrays(): CharacterPowerArrayList {
    return this.props.powerArrays;
  }
  get benefits(): CharacterBenefitList {
    return this.props.benefits;
  }

  get unarmedMastery(): UnarmedMastery {
    return this.props.unarmedMastery;
  }

  getCombatStats(equippedSuitRd = 0, equippedSuitBlockRd = 0, weaponShieldBlockRd = 0): CombatStats {
    const reflexosBonus = this.getSkillRollBonus('Reflexos', this.attributes.dexterity.rollModifier);
    // Bloqueio não é rolagem, portanto usa o baseModifier da Constituição, ignorando bônus extras da perícia e do atributo
    const fortitudeBonus = this.getSkillRollBonus('Fortitude', this.attributes.constitution.baseModifier, false);

    let dodge = reflexosBonus;

    if (this.conditions.failsReflexAndFortitude) {
      dodge = 0;
    } else if (this.conditions.halvesDefenses) {
      dodge = Math.floor(reflexosBonus / 2);
    }

    // RD Base: Apenas do traje ou de habilidades passivas
    // (Por enquanto usando apenas o suit RD passado)
    const baseDamageReduction = Math.max(0, equippedSuitRd);

    // RD para bloqueio: Bonus de fortitude + trajes + arma/escudo
    let blockDamageReduction = fortitudeBonus + equippedSuitBlockRd + weaponShieldBlockRd;

    if (this.conditions.failsReflexAndFortitude) {
      blockDamageReduction = 0;
    } else if (this.conditions.halvesDefenses) {
      blockDamageReduction = Math.floor(blockDamageReduction / 2);
    }

    return CombatStats.create({
      dodge,
      baseDamageReduction,
      blockDamageReduction: Math.max(0, blockDamageReduction),
    });
  }

  get calamityRank(): string {
    const lvl = this.level;
    if (lvl <= 7) return 'Raposa';
    if (lvl <= 12) return 'Lobo';
    if (lvl <= 22) return 'Tigre';
    if (lvl <= 42) return 'Demônio';
    if (lvl <= 72) return 'Dragão';
    if (lvl <= 102) return 'Celestial';
    if (lvl <= 162) return 'Ser Cósmico';
    if (lvl <= 192) return 'Semi Deuses';
    if (lvl <= 242) return 'Deuses Menores';
    return 'Deuses';
  }

  get efficiencyBonus(): number {
    return Math.round(3000 * Math.pow(this.level / 250, 2)) + 1;
  }

  getSkillRollBonus(
    skillName: import('./value-objects/skills-manager').SkillName,
    baseAttributeModifier: number,
    includeExtraBonus = true,
  ): number {
    const rawBonus = this.skills.calculateRollBonus(
      skillName,
      baseAttributeModifier,
      this.efficiencyBonus,
      includeExtraBonus,
    );

    return rawBonus - this.conditions.generalDisadvantageCount;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
updateAttributes(newAttributes: AttributeSet): void {
  this.props.attributes = newAttributes;

  this.props.health = HealthManager.create({
    level: this.level,
    constitutionModifier: this.attributes.constitution.baseModifier,
    currentPV: this.health.currentPV,
    temporaryPV: this.health.temporaryPV,
  });

  this.props.energy = EnergyManager.create({
    keyPhysicalModifier: this.attributes[this.attributes.keyPhysical].baseModifier,
    keyMentalModifier: this.attributes[this.attributes.keyMental].baseModifier,
    currentPE: this.energy.currentPE,
    temporaryPE: this.energy.temporaryPE,
  });

  this.props.slots = SlotManager.create({
    intelligenceModifier: this.attributes.intelligence.baseModifier,
    usedSlots: this.slots.usedSlots,
  });

  this.touch();
}

updateNarrative(narrative: NarrativeProfile): void {
  this.props.narrativeProfile = narrative;
  this.touch();
}

updateSymbol(symbol: string | null): void {
  this.props.symbol = symbol ?? undefined;
  this.touch();
}

updateArt(art: string | null): void {
  this.props.art = art ?? undefined;
  this.touch();
}

updateInspiration(inspiration: number): void {
  this.props.inspiration = Math.max(0, Math.min(3, inspiration));
  this.touch();
}

levelUp(): void {
  if (this.props.level >= 250) return;

  this.props.level += 1;

  this.props.pda = this.pda.updateLevel(this.props.level);
  this.props.health = this.health.updateLevel(this.props.level);

  this.touch();
  this.addDomainEvent(new CharacterLeveledUpEvent(this, this.props.level));
}

changeLevel(newLevel: number): void {
  if (newLevel < 1 || newLevel > 250) {
    throw new DomainValidationError('O nível deve estar entre 1 e 250.', 'level');
  }

  this.props.level = newLevel;

  this.props.pda = this.pda.updateLevel(this.props.level);
  this.props.health = this.health.updateLevel(this.props.level);

  this.touch();
}

setDomainMastery(domainId: string, masteryLevel: MasteryLevel): void {
  const existingIndex = this.props.domainMasteries.findIndex((m) => m.domainId === domainId);

  if (existingIndex >= 0) {
    this.props.domainMasteries[existingIndex] = DomainMastery.create({ domainId, masteryLevel });
  } else {
    this.props.domainMasteries.push(DomainMastery.create({ domainId, masteryLevel }));
  }

  this.touch();
}

removeDomainMastery(domainId: string): void {
  this.props.domainMasteries = this.props.domainMasteries.filter((m) => m.domainId !== domainId);
  this.touch();
}

updateUnarmedMastery(mastery: UnarmedMastery): void {
  this.props.unarmedMastery = mastery;
  this.touch();
}


unlockSpiritualPrinciple(stage: SpiritualStage = 'NORMAL'): void {
  if (this.props.spiritualPrinciple.isUnlocked) {
    throw new DomainValidationError('Princípio Espiritual já está desbloqueado.', 'spiritualPrinciple');
  }

  this.spendPda(15);

  this.props.spiritualPrinciple = SpiritualPrinciple.create({
    isUnlocked: true,
    stage,
  });

  this.touch();
}

evolveSpiritualPrinciple(): void {
  if (!this.props.spiritualPrinciple.isUnlocked) {
    throw new DomainValidationError('O personagem precisa ter despertado o Princípio Espiritual antes de evoluí-lo.', 'spiritualPrinciple');
  }

  if (this.props.spiritualPrinciple.stage === 'DIVINE') {
    throw new DomainValidationError('O Princípio Espiritual já atingiu o estágio Divino.', 'spiritualPrinciple');
  }

  if (this.level < 35) {
    throw new DomainValidationError('A evolução espiritual exige no mínimo o nível 35.', 'level');
  }

  this.props.spiritualPrinciple = SpiritualPrinciple.create({
    isUnlocked: true,
    stage: 'DIVINE',
  });

  this.touch();
}

  spendPda(amount: number): void {
    this.props.pda = this.pda.spend(amount);
    this.touch();
  }

  refundPda(amount: number): void {
    this.props.pda = this.pda.refund(amount);
    this.touch();
  }

updateExtraPda(amount: number): void {
  this.props.pda = this.pda.updateExtraPda(amount);
  this.touch();
}

takeDamage(amount: number): void {
    const finalDamage = amount * this.conditions.incomingDamageMultiplier;
    this.props.health = this.health.takeDamage(finalDamage);

    if (this.props.health.currentPV <= 0) {
      this.props.deathManager = this.deathManager.fallUnconscious();
    }
    this.touch();
  }

  heal(amount: number): void {
    this.props.health = this.health.heal(amount);
    if (this.props.health.currentPV > 0 && this.props.deathManager.state === 'DYING') {
      this.props.deathManager = this.deathManager.stabilize();
    }
    this.touch();
  }

  tickDeathCounter(): void {
    const { manager, justDied } = this.deathManager.tickDeathCounter();
    this.props.deathManager = manager;

    if (justDied) {
      this.addDomainEvent(new CharacterDiedEvent(this));
    }
    this.touch();
  }

  consumeEnergy(amount: number): void {
    const finalCost = amount * this.conditions.skillCostMultiplier;
    this.props.energy = this.energy.consume(finalCost);
    this.touch();
  }

  recoverEnergy(amount: number): void {
    if (this.conditions.blocksEnergyRecovery) {
      return;
    }
    this.props.energy = this.energy.recover(amount);
    this.touch();
  }

  addTemporaryPV(amount: number): void {
    this.props.health = this.health.addTemporaryPV(amount);
    this.touch();
  }

  addTemporaryPE(amount: number): void {
    this.props.energy = this.energy.addTemporaryPE(amount);
    this.touch();
  }

  updateSkill(
    skillName: import('./value-objects/skills-manager').SkillName,
    state: import('./value-objects/skills-manager').ProficiencyState,
    trainingBonus: number = 0,
    extraBonus: number = 0,
  ): void {
    this.props.skills = this.skills.setSkill(skillName, state, trainingBonus, extraBonus);
    this.touch();
  }

  applyCondition(condition: import('./value-objects/condition-manager').ConditionName): void {
    this.props.conditions = this.conditions.add(condition);
    this.touch();
  }

  removeCondition(condition: import('./value-objects/condition-manager').ConditionName): void {
    this.props.conditions = this.conditions.remove(condition);
    this.touch();
  }

  updateConditions(conditions: import('./value-objects/condition-manager').ConditionName[]): void {
    this.props.conditions = ConditionManager.create(conditions);
    this.touch();
  }

  addRunics(amount: number): void {
    this.props.inventory = this.inventory.addRunics(amount);
    this.touch();
  }

  spendRunics(amount: number): void {
    this.props.inventory = this.inventory.spendRunics(amount);
    this.touch();
  }

  addToInventory(itemId: string, quantity: number = 1): void {
    this.props.inventory = this.inventory.addItem(itemId, quantity);
    this.touch();
  }

  removeFromInventory(itemId: string, quantity: number = 1): void {
    const itemBefore = this.inventory.bag.find(i => i.itemId === itemId);
    this.props.inventory = this.inventory.removeItem(itemId, quantity);
    const itemAfter = this.inventory.bag.find(i => i.itemId === itemId);

    if (itemBefore && !itemAfter) {
      this.addDomainEvent(new CharacterItemDiscardedEvent(this, itemId));
    }

    this.touch();
  }

  setItemQuantityInInventory(itemId: string, quantity: number): void {
    const itemBefore = this.inventory.bag.find(i => i.itemId === itemId);
    this.props.inventory = this.inventory.setItemQuantity(itemId, quantity);
    const itemAfter = this.inventory.bag.find(i => i.itemId === itemId);

    if (itemBefore && quantity === 0) {
      this.addDomainEvent(new CharacterItemDiscardedEvent(this, itemId));
    }

    this.touch();
  }

  equipPower(powerId: string): void {
    const power = this.props.powers.getItems().find((p) => p.powerId === powerId);

    if (!power) {
      throw new DomainValidationError('Poder não encontrado na ficha.', 'powerId');
    }

    if (power.isEquipped) {
      return;
    }

    this.props.slots = this.slots.use(power.slotCost);
    power.equip();

    this.touch();
  }

  unequipPower(powerId: string): void {
    const power = this.props.powers.getItems().find((p) => p.powerId === powerId);

    if (!power) {
      throw new DomainValidationError('Poder não encontrado na ficha.', 'powerId');
    }

    if (!power.isEquipped) {
      return;
    }

    this.props.slots = this.slots.free(power.slotCost);
    power.unequip();

    this.touch();
  }

  equipPowerArray(arrayId: string): void {
    const array = this.props.powerArrays.getItems().find((a) => a.powerArrayId === arrayId);

    if (!array) {
      throw new DomainValidationError('Acervo não encontrado na ficha.', 'powerArrayId');
    }

    if (array.isEquipped) {
      return;
    }

    this.props.slots = this.slots.use(array.slotCost);
    array.equip();

    this.touch();
  }

  unequipPowerArray(arrayId: string): void {
    const array = this.props.powerArrays.getItems().find((a) => a.powerArrayId === arrayId);

    if (!array) {
      throw new DomainValidationError('Acervo não encontrado na ficha.', 'powerArrayId');
    }

    if (!array.isEquipped) {
      return;
    }

    this.props.slots = this.slots.free(array.slotCost);
    array.unequip();

    this.touch();
  }

  removePower(powerId: string): void {
    const power = this.props.powers.getItems().find((p) => p.powerId === powerId);

    if (!power) {
      throw new DomainValidationError('Poder não encontrado na ficha.', 'powerId');
    }

    if (power.isEquipped) {
      this.unequipPower(powerId);
    }

    this.props.pda = this.pda.refund(power.finalPdaCost);
    this.props.powers.remove(power);
    this.addDomainEvent(new CharacterPowerDiscardedEvent(this, powerId));
    this.touch();
  }

  removePowerArray(arrayId: string): void {
    const array = this.props.powerArrays.getItems().find((a) => a.powerArrayId === arrayId);

    if (!array) {
      throw new DomainValidationError('Acervo não encontrado na ficha.', 'powerArrayId');
    }

    if (array.isEquipped) {
      this.unequipPowerArray(arrayId);
    }

    this.props.pda = this.pda.refund(array.finalPdaCost);
    this.props.powerArrays.remove(array);
    this.addDomainEvent(new CharacterPowerArrayDiscardedEvent(this, arrayId));
    this.touch();
  }

  removeBenefit(benefitId: string): void {
    const benefit = this.props.benefits.getItems().find((b) => b.id.toString() === benefitId);

    if (!benefit) {
      throw new DomainValidationError('Benefício não encontrado na ficha.', 'benefitId');
    }

    this.props.pda = this.pda.refund(benefit.pdaCost);
    this.props.benefits.remove(benefit);
    this.touch();
  }

  equipItem(itemId: string, slot: 'suit' | 'accessory' | 'hand' | 'quick-access', quantity: number = 1, maxStack: number = 1): void {
    this.removeFromInventory(itemId, quantity);

    if (slot === 'suit') {
      if (this.equipment.suitId) {
        this.addToInventory(this.equipment.suitId, 1);
      }
      this.props.equipment = this.equipment.equipSuit(itemId);
    } else if (slot === 'accessory') {
      if (this.equipment.accessoryId) {
        this.addToInventory(this.equipment.accessoryId, 1);
      }
      this.props.equipment = this.equipment.equipAccessory(itemId);
    } else if (slot === 'hand') {
      this.props.equipment = this.equipment.equipHand(itemId, quantity, maxStack);
    } else if (slot === 'quick-access') {
      this.props.equipment = this.equipment.addQuickAccess(itemId, quantity, maxStack);
    }

    this.touch();
  }

  unequipItem(itemId: string, slot: 'suit' | 'accessory' | 'hand' | 'quick-access', quantity: number = 1): void {
    if (slot === 'suit' && this.equipment.suitId === itemId) {
      this.props.equipment = this.equipment.unequipSuit();
    } else if (slot === 'accessory' && this.equipment.accessoryId === itemId) {
      this.props.equipment = this.equipment.unequipAccessory();
    } else if (slot === 'hand') {
      this.props.equipment = this.equipment.unequipHand(itemId, quantity);
    } else if (slot === 'quick-access') {
      this.props.equipment = this.equipment.removeQuickAccess(itemId, quantity);
    }

    this.addToInventory(itemId, quantity);
    this.touch();
  }

  applyRestResult(pvChange: number, peChange: number): void {
    if (pvChange > 0) {
      this.heal(pvChange);
    } else if (pvChange < 0) {
      this.takeDamage(Math.abs(pvChange));
    }

    if (peChange > 0) {
      this.recoverEnergy(peChange);
    } else if (peChange < 0) {
      this.consumeEnergy(Math.abs(peChange));
    }

    this.touch();
  }
}
