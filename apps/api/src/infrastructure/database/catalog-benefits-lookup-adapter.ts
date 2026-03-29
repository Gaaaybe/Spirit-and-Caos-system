import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { BenefitsLookupPort, type BenefitInfo } from '@/domain/character-manager/application/repositories/benefits-lookup-port';

@Injectable()
export class CatalogBenefitsLookupAdapter extends BenefitsLookupPort {
  private readonly dataPath = join(process.cwd(), 'data');

  async findByName(name: string): Promise<BenefitInfo | null> {
    const filePath = join(this.dataPath, 'beneficios.json');
    const fileContent = readFileSync(filePath, 'utf-8');
    const benefits = JSON.parse(fileContent) as BenefitInfo[];

    const normalizedName = name.trim().toLowerCase();
    const found = benefits.find((benefit) => benefit.nome.trim().toLowerCase() === normalizedName);

    return found ?? null;
  }
}
