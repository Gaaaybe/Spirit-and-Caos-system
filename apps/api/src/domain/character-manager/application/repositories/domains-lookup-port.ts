export abstract class DomainsLookupPort {
  abstract findById(id: string): Promise<any | null>;
}
