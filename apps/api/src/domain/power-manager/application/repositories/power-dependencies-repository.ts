export abstract class PowerDependenciesRepository {
  abstract isPowerLinkedToAnyItem(powerId: string): Promise<boolean>;
  abstract isPowerArrayLinkedToAnyItem(powerArrayId: string): Promise<boolean>;
}
