/**
 * Utilitários de Rolagem de Dados
 * Sistema simples e provisório para rolagem de dados d20
 */

/**
 * Resultado de uma rolagem
 */
export interface RollResult {
  total: number;
  d20: number;
  allRolls: number[];
  modifier: number;
  advantage: number;
  isCritical: boolean;
  isFumble: boolean;
  timestamp: Date;
}

/**
 * Rola um d20 com modificador e vantagem/desvantagem
 * @param modifier Modificador a ser somado
 * @param advantage >0 para vantagem, <0 para desvantagem, 0 para normal
 */
export function rollD20(modifier: number = 0, advantage: number = 0): RollResult {
  const numDice = 1 + Math.abs(advantage);
  const rolls: number[] = [];
  
  for (let i = 0; i < numDice; i++) {
    rolls.push(Math.floor(Math.random() * 20) + 1);
  }
  
  let d20: number;
  if (advantage > 0) {
    d20 = Math.max(...rolls);
  } else if (advantage < 0) {
    d20 = Math.min(...rolls);
  } else {
    d20 = rolls[0];
  }
  
  const total = d20 + modifier;
  
  return {
    total,
    d20,
    allRolls: rolls,
    modifier,
    advantage,
    isCritical: d20 === 20,
    isFumble: d20 === 1,
    timestamp: new Date(),
  };
}

/**
 * Rola múltiplos dados (ex: 2d6, 3d8)
 */
export function rollDice(numDice: number, diceSides: number): number {
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * diceSides) + 1;
  }
  return total;
}

/**
 * Rola dano (ex: "2d6+5") com suporte a multiplicador de crítico
 * O multiplicador afeta o resultado final do dano, e não a quantidade de dados.
 */
export function rollDamage(damageFormula: string, multiplier: number = 1): { total: number; rolls: number[]; modifier: number; baseTotal: number } {
  // Tenta casar com padrão XdY+Z ou XdY-Z
  const match = damageFormula.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i);
  
  if (!match) {
    // Tenta casar com dano plano (ex: "5" ou "+5")
    const flatMatch = damageFormula.replace(/\s+/g, '').match(/^([+-]?\d+)$/);
    if (flatMatch) {
       const flatDamage = parseInt(flatMatch[1]);
       const finalTotal = flatDamage * multiplier;
       return { total: finalTotal, rolls: [], modifier: flatDamage, baseTotal: flatDamage };
    }
    return { total: 0, rolls: [], modifier: 0, baseTotal: 0 };
  }
  
  const numDice = parseInt(match[1]);
  const diceSides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3].replace(/\s+/g, '')) : 0;
  
  const rolls: number[] = [];
  let baseTotal = 0;
  
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * diceSides) + 1;
    rolls.push(roll);
    baseTotal += roll;
  }
  
  baseTotal += modifier;
  const finalTotal = baseTotal * multiplier;
  
  return { total: finalTotal, rolls, modifier, baseTotal };
}

/**
 * Formata resultado de rolagem para exibição
 */
export function formatRollResult(result: RollResult): string {
  const criticalText = result.isCritical ? ' ⭐ CRÍTICO!' : result.isFumble ? ' 💀 FALHA!' : '';
  const modifierText = result.modifier >= 0 ? `+${result.modifier}` : `${result.modifier}`;
  
  let advantageText = '';
  if (result.advantage > 0) {
    advantageText = ` (Vantagem: [${result.allRolls.join(', ')}])`;
  } else if (result.advantage < 0) {
    advantageText = ` (Desvantagem: [${result.allRolls.join(', ')}])`;
  }
  
  return `🎲 ${result.d20} ${modifierText} = ${result.total}${criticalText}${advantageText}`;
}
