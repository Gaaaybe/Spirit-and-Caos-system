import { Injectable } from '@nestjs/common';
import type { PowerArrayInfo } from '@/domain/item-manager/application/repositories/power-arrays-lookup-port';
import { PowerArraysLookupPort } from '@/domain/item-manager/application/repositories/power-arrays-lookup-port';
import { DomainName } from '@/domain/shared/enterprise/value-objects/domain';
import { PrismaService } from './prisma/prisma.service';

const DOMAIN_NAME_MAP: Record<string, DomainName> = {
  NATURAL: DomainName.NATURAL,
  SAGRADO: DomainName.SAGRADO,
  SACRILEGIO: DomainName.SACRILEGIO,
  PSIQUICO: DomainName.PSIQUICO,
  CIENTIFICO: DomainName.CIENTIFICO,
  PECULIAR: DomainName.PECULIAR,
  ARMA_BRANCA: DomainName.ARMA_BRANCA,
  ARMA_FOGO: DomainName.ARMA_FOGO,
  ARMA_TENSAO: DomainName.ARMA_TENSAO,
  ARMA_EXPLOSIVA: DomainName.ARMA_EXPLOSIVA,
  ARMA_TECNOLOGICA: DomainName.ARMA_TECNOLOGICA,
};

@Injectable()
export class PrismaPowerArraysLookupAdapter extends PowerArraysLookupPort {
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
        powerArrayPowers: {
          select: {
            power: {
              select: {
                appliedEffects: {
                  select: { grau: true },
                },
              },
            },
          },
        },
      },
    });

    if (!raw) return null;

    return {
      id: raw.id,
      nome: raw.nome,
      domainName: DOMAIN_NAME_MAP[raw.domainName],
      itemLevelContribution: raw.powerArrayPowers.reduce(
        (total, link) =>
          total + link.power.appliedEffects.reduce((sum, effect) => sum + effect.grau, 0),
        0,
      ),
    };
  }
}
