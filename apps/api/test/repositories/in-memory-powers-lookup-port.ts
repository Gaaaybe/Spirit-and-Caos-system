import {
  PowersLookupPort,
  type PowerInfo,
} from '@/domain/character-manager/application/repositories/powers-lookup-port';

export class InMemoryPowersLookupPort extends PowersLookupPort {
  public items: PowerInfo[] = [];

  async findById(id: string): Promise<PowerInfo | null> {
    const power = this.items.find((p) => p.id === id);

    if (!power) {
      return null;
    }

    return power;
  }

  async createCharacterInstance(powerId: string, characterId: string, userId: string): Promise<string | null> {
    const power = this.items.find((p) => p.id === powerId);

    if (!power) {
      return null;
    }

    const newId = `instance-${power.id}-${characterId}`;
    this.items.push({ ...power, id: newId });

    return newId;
  }
}
