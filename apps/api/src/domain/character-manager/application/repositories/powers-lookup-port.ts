export interface PowerInfo {
  id: string;
  nome: string;
  domainId: string;
  pdaCost: number;
  slotCost: number;
}

export abstract class PowersLookupPort {
  abstract findById(id: string): Promise<PowerInfo | null>;
  abstract createCharacterInstance(powerId: string, characterId: string, userId: string): Promise<string | null>;
}
