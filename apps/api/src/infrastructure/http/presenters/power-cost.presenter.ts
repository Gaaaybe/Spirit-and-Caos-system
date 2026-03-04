import { PowerCost } from '@/domain/power-manager/enterprise/entities/value-objects/power-cost';

export class PowerCostPresenter {
  static toHTTP(cost: PowerCost) {
    return {
      pda: cost.pda,
      pe: cost.pe,
      espacos: cost.espacos,
    };
  }
}
