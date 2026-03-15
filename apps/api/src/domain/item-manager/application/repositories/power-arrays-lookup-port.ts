import type { DomainName } from '@/domain/shared/enterprise/value-objects/domain';

export interface PowerArrayInfo {
  id: string;
  nome: string;
  domainName: DomainName;
  itemLevelContribution: number;
}

export abstract class PowerArraysLookupPort {
  abstract findById(id: string): Promise<PowerArrayInfo | null>;
}
