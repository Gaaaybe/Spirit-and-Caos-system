import { Injectable } from '@nestjs/common';
import { PowerDependenciesRepository } from '@/domain/power-manager/application/repositories/power-dependencies-repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaPowerDependenciesRepository extends PowerDependenciesRepository {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isPowerLinkedToAnyItem(powerId: string): Promise<boolean> {
    const count = await this.prisma.itemPower.count({ where: { powerId } });
    return count > 0;
  }

  async isPowerArrayLinkedToAnyItem(powerArrayId: string): Promise<boolean> {
    const count = await this.prisma.itemPowerArray.count({ where: { powerArrayId } });
    return count > 0;
  }
}
