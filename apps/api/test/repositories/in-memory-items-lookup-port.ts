import { ItemsLookupPort } from '@/domain/character-manager/application/repositories/items-lookup-port';

export class InMemoryItemsLookupPort implements ItemsLookupPort {
  public items: any[] = [];

  async findById(id: string): Promise<any | null> {
    const item = this.items.find((item) => item.id.toString() === id);

    if (!item) {
      return null;
    }

    return item;
  }

  async createCharacterInstance(itemId: string, characterId: string, userId: string): Promise<string | null> {
    const item = this.items.find((item) => item.id.toString() === itemId);

    if (!item) {
      return null;
    }

    const newId = `instance-${item.id}-${characterId}`;
    const newItem = { ...item, id: newId, characterId, userId };
    this.items.push(newItem);

    return newId;
  }

  async upgradeItem(itemId: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id.toString() === itemId);

    if (index >= 0) {
      const currentUpgrade = this.items[index].upgradeLevel?.value ?? 0;
      const maxUpgrade = this.items[index].upgradeLevel?.maxLevel ?? 7;

      this.items[index] = {
        ...this.items[index],
        upgradeLevel: {
          value: Math.min(currentUpgrade + 1, maxUpgrade),
          maxLevel: maxUpgrade,
          getMultiplier: () => Math.pow(2, Math.min(currentUpgrade + 1, maxUpgrade)),
        }
      };
    }
  }
}
