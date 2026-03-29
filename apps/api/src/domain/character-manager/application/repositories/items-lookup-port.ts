export abstract class ItemsLookupPort {
  abstract findById(id: string): Promise<any | null>;
  abstract createCharacterInstance(itemId: string, characterId: string, userId: string): Promise<string | null>;
  abstract upgradeItem(itemId: string): Promise<void>;
}
