import { Injectable } from '@nestjs/common';

export interface BenefitCatalogEntry {
  nome: string;
  tipo: string;
  graus: number | string | 'Vários';
  descricao: string;
  custo_base?: number;
  regra_custo?: 'linear' | 'dobro_por_grau';
}

@Injectable()
export class CalculateBenefitCostService {

  execute(benefit: BenefitCatalogEntry, targetDegree: number, currentDegree = 0): number {
    const baseCost = benefit.custo_base ?? 3;
    const rule = benefit.regra_custo ?? 'linear';

    const calculateTotalCostForDegree = (degree: number): number => {
      if (degree <= 0) return 0;
      
      if (rule === 'dobro_por_grau') {

        return baseCost * (Math.pow(2, degree) - 1);
      }
      return baseCost * degree;
    };

    const targetTotalCost = calculateTotalCostForDegree(targetDegree);
    const currentTotalCost = calculateTotalCostForDegree(currentDegree);

    return targetTotalCost - currentTotalCost;
  }
}
