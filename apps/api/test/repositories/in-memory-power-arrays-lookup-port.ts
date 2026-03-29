import { PowerArraysLookupPort, type PowerArrayInfo } from '@/domain/item-manager/application/repositories/power-arrays-lookup-port';

export class InMemoryPowerArraysLookupPort extends PowerArraysLookupPort {
  public items: PowerArrayInfo[] = [];

  async findById(id: string): Promise<PowerArrayInfo | null> {
    const array = this.items.find((a) => a.id === id);

    if (!array) {
      return null;
    }

    return array;
  }

  async createCharacterInstance(powerArrayId: string, characterId: string, userId: string): Promise<string | null> {
    const array = this.items.find((a) => a.id === powerArrayId);

    if (!array) {
      return null;
    }

    const newId = `instance-${array.id}-${characterId}`;
    this.items.push({ ...array, id: newId });

    return newId;
  }
}
