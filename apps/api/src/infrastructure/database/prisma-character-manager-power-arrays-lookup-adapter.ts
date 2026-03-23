import { Injectable } from '@nestjs/common';
import {
  PowerArraysLookupPort,
  type PowerArrayInfo,
} from '@/domain/character-manager/application/repositories/power-arrays-lookup-port';
import { PrismaService } from './prisma/prisma.service';

const DOMAIN_NAME_TO_ID: Record<string, string> = {
  NATURAL: 'natural',
  SAGRADO: 'sagrado',
  SACRILEGIO: 'sacrilegio',
  PSIQUICO: 'psiquico',
  CIENTIFICO: 'cientifico',
  PECULIAR: 'peculiar',
  ARMA_BRANCA: 'arma-branca',
  ARMA_FOGO: 'arma-fogo',
  ARMA_TENSAO: 'arma-tensao',
  ARMA_EXPLOSIVA: 'arma-explosiva',
  ARMA_TECNOLOGICA: 'arma-tecnologica',
};

@Injectable()
export class PrismaCharacterManagerPowerArraysLookupAdapter extends PowerArraysLookupPort {
  constructor(private prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<PowerArrayInfo | null> {
    const raw = await this.prisma.powerArray.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        domainName: true,
        custoTotalPda: true,
        custoTotalEspacos: true,
      },
    });

    if (!raw) {
      return null;
    }

    return {
      id: raw.id,
      nome: raw.nome,
      domainId: DOMAIN_NAME_TO_ID[raw.domainName],
      pdaCost: raw.custoTotalPda,
      slotCost: raw.custoTotalEspacos,
    };
  }

  async createCharacterInstance(
    powerArrayId: string,
    characterId: string,
    userId: string,
  ): Promise<string | null> {
    const original = await this.prisma.powerArray.findUnique({
      where: { id: powerArrayId },
      include: {
        powerArrayPowers: {
          orderBy: { posicao: 'asc' },
        },
      },
    });

    if (!original) {
      return null;
    }

    const copy = await this.prisma.powerArray.create({
      data: {
        userId,
        characterId,
        nome: original.nome,
        descricao: original.descricao,
        isPublic: false,
        icone: original.icone,
        notas: original.notas,
        domainName: original.domainName,
        domainAreaConhecimento: original.domainAreaConhecimento,
        domainPeculiarId: original.domainPeculiarId,
        parametrosBaseAcao: original.parametrosBaseAcao,
        parametrosBaseAlcance: original.parametrosBaseAlcance,
        parametrosBaseDuracao: original.parametrosBaseDuracao,
        custoTotalPda: original.custoTotalPda,
        custoTotalPe: original.custoTotalPe,
        custoTotalEspacos: original.custoTotalEspacos,
        powerArrayPowers: {
          create: original.powerArrayPowers.map((entry) => ({
            powerId: entry.powerId,
            posicao: entry.posicao,
          })),
        },
      },
    });

    return copy.id;
  }
}
