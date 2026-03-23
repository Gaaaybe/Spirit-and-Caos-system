export interface PowerArrayInfo {
  id: string;
  nome: string;
  domainId: string;
  pdaCost: number;
  slotCost: number;
}

export abstract class PowerArraysLookupPort {
  abstract findById(id: string): Promise<PowerArrayInfo | null>;
  abstract createCharacterInstance(powerArrayId: string, characterId: string, userId: string): Promise<string | null>;
}
