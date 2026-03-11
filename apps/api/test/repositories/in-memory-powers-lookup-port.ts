import type { PowerInfo } from '@/domain/item-manager/application/repositories/powers-lookup-port';
import { PowersLookupPort } from '@/domain/item-manager/application/repositories/powers-lookup-port';

export class InMemoryPowersLookupPort extends PowersLookupPort {
  public powers: PowerInfo[] = [];

  async findById(id: string): Promise<PowerInfo | null> {
    return this.powers.find((p) => p.id === id) ?? null;
  }
}
