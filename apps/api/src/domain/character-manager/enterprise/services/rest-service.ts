import { Injectable } from '@nestjs/common';

export type RestQuality = 'RUIM' | 'NORMAL' | 'CONFORTAVEL' | 'LUXUOSA';

interface RestCalculationInput {
  quality: RestQuality;
  durationHours: number;
  hasInjury: boolean;
  hasCare: boolean;
  maxPV: number;
  maxPE: number;
  currentPV: number;
  currentPE: number;
  rolls: {
    pvRoll1: number;
    pvRoll2: number;
    peRoll1: number;
    peRoll2: number;
    injuryPenaltyPvRoll: number;
    injuryPenaltyPeRoll: number;
  };
}

interface RestCalculationResult {
  pvChange: number;
  peChange: number;
}

@Injectable()
export class RestService {
  execute(input: RestCalculationInput): RestCalculationResult {
    const { quality, durationHours, hasInjury, hasCare, maxPV, maxPE, currentPV, currentPE, rolls } = input;

    const timeMultiplier = Math.min(1, Math.max(2, durationHours) / 8);

    let effectiveQuality = quality;

    if (hasInjury) {
      if (effectiveQuality === 'LUXUOSA') effectiveQuality = 'CONFORTAVEL';
      else if (effectiveQuality === 'CONFORTAVEL') effectiveQuality = 'NORMAL';
      else if (effectiveQuality === 'NORMAL') effectiveQuality = 'RUIM';
    }

    if (effectiveQuality === 'RUIM' && hasInjury) {
      return {
        pvChange: -rolls.injuryPenaltyPvRoll,
        peChange: -rolls.injuryPenaltyPeRoll,
      };
    }

    let pvRecovered = 0;
    let peRecovered = 0;

    switch (effectiveQuality) {
      case 'RUIM':
        pvRecovered = rolls.pvRoll1 / 3;
        peRecovered = rolls.peRoll1 / 3;
        break;
      case 'NORMAL':
        pvRecovered = rolls.pvRoll1 / 2;
        peRecovered = rolls.peRoll1 / 2;
        break;
      case 'CONFORTAVEL':
        pvRecovered = rolls.pvRoll1;
        peRecovered = rolls.peRoll1;
        break;
      case 'LUXUOSA':
        pvRecovered = rolls.pvRoll1 + rolls.pvRoll2;
        peRecovered = rolls.peRoll1 + rolls.peRoll2;
        break;
    }

    pvRecovered *= timeMultiplier;
    peRecovered *= timeMultiplier;

    if (hasInjury && !hasCare) {
      pvRecovered = 0;
    }

    return {
      pvChange: Math.floor(pvRecovered),
      peChange: Math.floor(peRecovered),
    };
  }
}
