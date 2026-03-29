import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { DomainsLookupPort } from '@/domain/character-manager/application/repositories/domains-lookup-port';
import { PeculiaritiesRepository } from '@/domain/power-manager/application/repositories/peculiarities-repository';

@Injectable()
export class CatalogDomainsLookupAdapter extends DomainsLookupPort {
  private readonly dataPath = join(process.cwd(), 'data');

  constructor(private peculiaritiesRepository: PeculiaritiesRepository) {
    super();
  }

  async findById(id: string): Promise<any | null> {
    // 1. Check in static dominios.json
    const filePath = join(this.dataPath, 'dominios.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const domains = JSON.parse(fileContent) as Array<{ id: string }>;

    const normalizedId = id.trim().toLowerCase();
    const found = domains.find((domain) => domain.id.trim().toLowerCase() === normalizedId);

    if (found) {
      return found;
    }

    // 2. Check in PeculiaritiesRepository
    try {
      const peculiarity = await this.peculiaritiesRepository.findById(id);
      if (peculiarity) {
        return {
          id: peculiarity.id.toString(),
          nome: peculiarity.nome,
          categoria: 'especial',
          espiritual: peculiarity.espiritual,
          icone: peculiarity.icone,
        };
      }
    } catch (e) {
      // In case of invalid UUID or other error
    }

    return null;
  }
}
