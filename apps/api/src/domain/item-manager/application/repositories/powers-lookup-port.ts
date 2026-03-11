import type { DomainName } from '@/domain/shared/enterprise/value-objects/domain';

export interface PowerInfo {
  id: string;
  nome: string;
  domainName: DomainName;
}

export abstract class PowersLookupPort {
  abstract findById(id: string): Promise<PowerInfo | null>;
}
