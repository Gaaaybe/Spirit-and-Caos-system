import { Character } from '@/domain/character-manager/enterprise/entities/character';
import { Peculiarity } from '@/domain/power-manager/enterprise/entities/peculiarity';
import { Item, ItemBaseProps } from '@/domain/item-manager/enterprise/entities/item';
import { DefensiveEquipment, EquipmentType } from '@/domain/item-manager/enterprise/entities/defensive-equipment';

export class CharacterPresenter {
  static toHTTP(character: Character, peculiarities: Peculiarity[] = [], items: Item<ItemBaseProps>[] = []) {
    // Cálculo de RD automatizado
    let suitRD = 0;
    let suitBlockRD = 0;
    let handsBlockRD = 0;

    // 1. Procurar Traje equipado
    if (character.equipment.suitId) {
      const suitItem = items.find(i => i.id.toString() === character.equipment.suitId);
      if (suitItem instanceof DefensiveEquipment && suitItem.tipoEquipamento === EquipmentType.TRAJE) {
        suitRD = suitItem.rdAtual;
        // Se o sistema tiver RD de bloqueio específica para trajes no futuro, adicionamos aqui
      }
    }

    // 2. Procurar Proteções nas mãos
    character.equipment.hands.forEach(h => {
      const handItem = items.find(i => i.id.toString() === h.itemId);
      if (handItem instanceof DefensiveEquipment && handItem.tipoEquipamento === EquipmentType.PROTECAO) {
        handsBlockRD += handItem.rdAtual;
      }
    });

    const stats = character.getCombatStats(suitRD, suitBlockRD, handsBlockRD);

    return {
      id: character.id.toString(),
      userId: character.userId.toString(),
      level: character.level,
      inspiration: character.inspiration,
      calamityRank: character.calamityRank,
      efficiencyBonus: character.efficiencyBonus,
      narrative: {
        identity: character.narrative.identity,
        origin: character.narrative.origin,
        motivations: character.narrative.motivations,
        complications: character.narrative.complications,
      },
      attributes: {
        strength: {
          baseValue: character.attributes.strength.baseValue,
          extraBonus: character.attributes.strength.extraBonus,
          baseModifier: character.attributes.strength.baseModifier,
          rollModifier: character.attributes.strength.rollModifier,
        },
        dexterity: {
          baseValue: character.attributes.dexterity.baseValue,
          extraBonus: character.attributes.dexterity.extraBonus,
          baseModifier: character.attributes.dexterity.baseModifier,
          rollModifier: character.attributes.dexterity.rollModifier,
        },
        constitution: {
          baseValue: character.attributes.constitution.baseValue,
          extraBonus: character.attributes.constitution.extraBonus,
          baseModifier: character.attributes.constitution.baseModifier,
          rollModifier: character.attributes.constitution.rollModifier,
        },
        intelligence: {
          baseValue: character.attributes.intelligence.baseValue,
          extraBonus: character.attributes.intelligence.extraBonus,
          baseModifier: character.attributes.intelligence.baseModifier,
          rollModifier: character.attributes.intelligence.rollModifier,
        },
        wisdom: {
          baseValue: character.attributes.wisdom.baseValue,
          extraBonus: character.attributes.wisdom.extraBonus,
          baseModifier: character.attributes.wisdom.baseModifier,
          rollModifier: character.attributes.wisdom.rollModifier,
        },
        charisma: {
          baseValue: character.attributes.charisma.baseValue,
          extraBonus: character.attributes.charisma.extraBonus,
          baseModifier: character.attributes.charisma.baseModifier,
          rollModifier: character.attributes.charisma.rollModifier,
        },
        keyPhysical: character.attributes.keyPhysical,
        keyMental: character.attributes.keyMental,
      },
      skills: Array.from(character.skills.entries.entries()).map(([name, value]) => ({
        name,
        proficiencyState: value.proficiencyState,
        trainingBonus: value.trainingBonus,
        extraBonus: value.extraBonus,
      })),
      spiritualPrinciple: {
        isUnlocked: character.spiritualPrinciple.isUnlocked,
        stage: character.spiritualPrinciple.stage,
      },
      domainMasteries: character.domainMasteries.map((domain) => {
        const peculiarity = peculiarities.find(p => p.id.toString() === domain.domainId);
        return {
          domainId: domain.domainId,
          masteryLevel: domain.masteryLevel,
          nome: peculiarity?.nome ?? null,
          icone: peculiarity?.icone ?? null,
        };
      }),
      pda: {
        total: character.pda.totalPda,
        spent: character.pda.spentPda,
        extra: character.pda.extraPda,
        available: character.pda.availablePda,
      },
      health: {
        maxPV: character.health.maxPV,
        currentPV: character.health.currentPV,
        temporaryPV: character.health.temporaryPV,
      },
      energy: {
        maxPE: character.energy.maxPE,
        currentPE: character.energy.currentPE,
        temporaryPE: character.energy.temporaryPE,
      },
      slots: {
        maxSlots: character.slots.maxSlots,
        usedSlots: character.slots.usedSlots,
        availableSlots: character.slots.availableSlots,
      },
      conditions: character.conditions.activeConditions,
      death: {
        state: character.deathManager.state,
        counter: character.deathManager.deathCounter,
      },
      inventory: {
        runics: character.inventory.runics,
        bag: character.inventory.bag,
      },
      equipment: {
        suitId: character.equipment.suitId ?? null,
        accessoryId: character.equipment.accessoryId ?? null,
        hands: character.equipment.hands,
        quickAccess: character.equipment.quickAccess,
        numberOfHands: character.equipment.numberOfHands,
        maxQuickAccessSlots: character.equipment.maxQuickAccessSlots,
      },
      powers: character.powers.getItems().map((power) => ({
        id: power.id.toString(),
        powerId: power.powerId,
        isEquipped: power.isEquipped,
        finalPdaCost: power.finalPdaCost,
        slotCost: power.slotCost,
      })),
      powerArrays: character.powerArrays.getItems().map((powerArray) => ({
        id: powerArray.id.toString(),
        powerArrayId: powerArray.powerArrayId,
        isEquipped: powerArray.isEquipped,
        finalPdaCost: powerArray.finalPdaCost,
        slotCost: powerArray.slotCost,
      })),
      benefits: character.benefits.getItems().map((benefit) => ({
        id: benefit.id.toString(),
        name: benefit.name,
        degree: benefit.degree,
        pdaCost: benefit.pdaCost,
      })),
      unarmedMastery: {
        customName: character.unarmedMastery.customName,
        degree: character.unarmedMastery.degree,
        marginImprovements: character.unarmedMastery.marginImprovements,
        multiplierImprovements: character.unarmedMastery.multiplierImprovements,
        damageType: character.unarmedMastery.damageType,
        damageDie: character.unarmedMastery.damageDie,
        criticalMargin: character.unarmedMastery.criticalMargin,
        criticalMultiplier: character.unarmedMastery.criticalMultiplier,
        totalPdaCost: character.unarmedMastery.totalPdaCost,
      },
      symbol: character.symbol ?? null,
      art: character.art ?? null,
      combatStats: {
        dodge: stats.dodge,
        baseRD: stats.baseRD,
        blockRD: stats.blockRD,
      },
      createdAt: character.createdAt,
      updatedAt: character.updatedAt ?? null,
    };
  }
}
