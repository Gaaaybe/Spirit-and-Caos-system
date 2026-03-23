export interface BenefitInfo {
  nome: string;
  tipo: string;
  graus: number | string | 'Vários';
  descricao: string;
  custo_base?: number;
  regra_custo?: 'linear' | 'dobro_por_grau';
}

export abstract class BenefitsLookupPort {
  abstract findByName(name: string): Promise<BenefitInfo | null>;
}
