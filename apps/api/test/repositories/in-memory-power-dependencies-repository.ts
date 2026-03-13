import { PowerDependenciesRepository } from '@/domain/power-manager/application/repositories/power-dependencies-repository';

export class InMemoryPowerDependenciesRepository extends PowerDependenciesRepository {
  public linkedPowerIds = new Set<string>();
  public linkedPowerArrayIds = new Set<string>();

  async isPowerLinkedToAnyItem(powerId: string): Promise<boolean> {
    return this.linkedPowerIds.has(powerId);
  }

  async isPowerArrayLinkedToAnyItem(powerArrayId: string): Promise<boolean> {
    return this.linkedPowerArrayIds.has(powerArrayId);
  }
}
