import { Injectable } from '@nestjs/common';
import { ItemsLookupPort } from '@/domain/character-manager/application/repositories/items-lookup-port';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class PrismaCharacterManagerItemsLookupAdapter extends ItemsLookupPort {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<any | null> {
    return this.prisma.item.findUnique({
      where: { id },
      select: {
        id: true,
        tipo: true,
        characterId: true,
        maxStack: true,
        upgradeLevelValue: true,
        upgradeLevelMax: true,
        materialMaxUpgradeLimit: true,
      },
    });
  }

  async createCharacterInstance(itemId: string, characterId: string, userId: string): Promise<string | null> {
    const original = await this.prisma.item.findUnique({
      where: { id: itemId },
      include: {
        itemDamages: { orderBy: { posicao: 'asc' } },
        itemPowers: { orderBy: { posicao: 'asc' } },
        itemPowerArrays: { orderBy: { posicao: 'asc' } },
      },
    });

    if (!original) {
      return null;
    }

    const copy = await this.prisma.item.create({
      data: {
        userId,
        characterId,
        tipo: original.tipo,
        nome: original.nome,
        descricao: original.descricao,
        isPublic: false,
        icone: original.icone,
        notas: original.notas,
        durabilidade: original.durabilidade,
        canStack: original.canStack,
        maxStack: original.maxStack,
        domainName: original.domainName,
        domainAreaConhecimento: original.domainAreaConhecimento,
        domainPeculiarId: original.domainPeculiarId,
        custoBase: original.custoBase,
        nivelItem: original.nivelItem,
        critMargin: original.critMargin,
        critMultiplier: original.critMultiplier,
        alcance: original.alcance,
        alcanceExtraMetrosMetades: original.alcanceExtraMetrosMetades,
        atributoEscalonamento: original.atributoEscalonamento,
        upgradeLevelValue: original.upgradeLevelValue,
        upgradeLevelMax: original.upgradeLevelMax,
        tipoEquipamento: original.tipoEquipamento,
        baseRD: original.baseRD,
        descritorEfeito: original.descritorEfeito,
        qtdDoses: original.qtdDoses,
        isRefeicao: original.isRefeicao,
        spoilageState: original.spoilageState,
        isAttuned: original.isAttuned,
        materialTier: original.materialTier,
        materialMaxUpgradeLimit: original.materialMaxUpgradeLimit,
        itemDamages: {
          create: original.itemDamages.map((entry) => ({
            dado: entry.dado,
            base: entry.base,
            espiritual: entry.espiritual,
            posicao: entry.posicao,
          })),
        },
        itemPowers: {
          create: original.itemPowers.map((entry) => ({
            powerId: entry.powerId,
            posicao: entry.posicao,
          })),
        },
        itemPowerArrays: {
          create: original.itemPowerArrays.map((entry) => ({
            powerArrayId: entry.powerArrayId,
            posicao: entry.posicao,
          })),
        },
      },
    });

    return copy.id;
  }

  async upgradeItem(itemId: string): Promise<void> {
    const item = await this.prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        tipo: true,
        upgradeLevelValue: true,
        upgradeLevelMax: true,
      },
    });

    if (!item) {
      return;
    }

    if (item.tipo !== 'WEAPON' && item.tipo !== 'DEFENSIVE_EQUIPMENT') {
      return;
    }

    const current = item.upgradeLevelValue ?? 0;
    const max = item.upgradeLevelMax ?? 0;

    if (current >= max) {
      return;
    }

    await this.prisma.item.update({
      where: { id: itemId },
      data: { upgradeLevelValue: current + 1 },
    });
  }
}
