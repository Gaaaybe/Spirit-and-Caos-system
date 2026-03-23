import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { DomainsLookupPort } from '@/domain/character-manager/application/repositories/domains-lookup-port';

@Injectable()
export class CatalogDomainsLookupAdapter extends DomainsLookupPort {
  private readonly dataPath = join(process.cwd(), 'data');

  async findById(id: string): Promise<any | null> {
    const filePath = join(this.dataPath, 'dominios.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const domains = JSON.parse(fileContent) as Array<{ id: string }>;

    const normalizedId = id.trim().toLowerCase();
    const found = domains.find((domain) => domain.id.trim().toLowerCase() === normalizedId);

    return found ?? null;
  }
}
