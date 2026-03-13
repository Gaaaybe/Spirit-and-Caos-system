import type { PowerArrayInfo } from '@/domain/item-manager/application/repositories/power-arrays-lookup-port';
import { PowerArraysLookupPort } from '@/domain/item-manager/application/repositories/power-arrays-lookup-port';

export class InMemoryPowerArraysLookupPort extends PowerArraysLookupPort {
  public powerArrays: PowerArrayInfo[] = [];

  async findById(id: string): Promise<PowerArrayInfo | null> {
    return this.powerArrays.find((p) => p.id === id) ?? null;
  }
}
