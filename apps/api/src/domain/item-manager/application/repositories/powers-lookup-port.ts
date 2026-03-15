import type { DomainName } from '@/domain/shared/enterprise/value-objects/domain';

export interface PowerInfo {
  id: string;
  nome: string;
  domainName: DomainName;
  itemLevelContribution: number;
}

export abstract class PowersLookupPort {
  abstract findById(id: string): Promise<PowerInfo | null>;
}
