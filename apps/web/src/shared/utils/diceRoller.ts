import { DiceRoll } from '@dice-roller/rpg-dice-roller';

/**
 * Resultado de uma rolagem
 */
export interface RollResult {
  total: number;
  d20: number;
  allRolls: number[];
  modifier: number;
  advantage: number; // >0 para vantagem, <0 para desvantagem
  isCritical: boolean;
  isFumble: boolean;
  timestamp: Date;
  expression: string;
}

/**
 * Rola um d20 com modificador e suporte a múltiplas vantagens/desvantagens
 */
export function rollD20(
  modifier: number = 0, 
  extraDice: number = 0, 
  rule: 'advantage' | 'disadvantage' | 'normal' = 'normal',
  critMargin: number = 20
): RollResult {
  const numDice = 1 + extraDice;
  let formula = `${numDice}d20`;
  
  if (rule === 'advantage') {
    formula += `kh1`;
  } else if (rule === 'disadvantage') {
    formula += `kl1`;
  }
  
  const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const expression = modifier !== 0 ? `${formula}${modStr}` : formula;
  
  const roll = new DiceRoll(expression);
  
  // A biblioteca retorna as rolagens detalhadas no primeiro grupo da notação
  const firstGroup = (roll as any).rolls[0];
  const allRolls: number[] = [];
  let d20 = 0;

  if (firstGroup && firstGroup.type === 'die') {
    firstGroup.rolls.forEach((r: any) => allRolls.push(r.initialValue));
    d20 = firstGroup.value; // O valor que efetivamente contou (após aplicar os keep/drop)
  }

  // Falha crítica e sucesso em Vantagem dependem do dado final que sobrou
  return {
    total: roll.total,
    d20,
    allRolls,
    modifier,
    advantage: rule === 'advantage' ? extraDice : rule === 'disadvantage' ? -extraDice : 0,
    isCritical: d20 >= critMargin,
    isFumble: d20 === 1,
    timestamp: new Date(),
    expression: roll.output,
  };
}

/**
 * Rola múltiplos dados (ex: 2d6, 3d8)
 */
export function rollDice(numDice: number, diceSides: number): number {
  const roll = new DiceRoll(`${numDice}d${diceSides}`);
  return roll.total;
}

/**
 * Rola dano (ex: "2d6+5", "1d8 + 1d6 + 5") com suporte a multiplicador de crítico.
 */
export function rollDamage(damageFormula: string, multiplier: number = 1): { total: number; rolls: number[]; modifier: number; baseTotal: number; expression: string } {
  // Limpar espaços e padronizar
  const cleanFormula = damageFormula.replace(/\s+/g, '').toLowerCase();
  if (!cleanFormula) {
    return { total: 0, rolls: [], modifier: 0, baseTotal: 0, expression: "" };
  }

  const roll = new DiceRoll(cleanFormula);
  const baseTotal = roll.total;
  
  const allRolls: number[] = [];
  let detectedModifier = 0;

  // Analisamos os grupos de rolagens gerados pela lib
  (roll as any).rolls.forEach((r: any) => {
    if (r.type === 'die') {
      r.rolls.forEach((dieRoll: any) => allRolls.push(dieRoll.initialValue));
    }
  });

  const finalTotal = baseTotal * multiplier;
  
  return { 
    total: finalTotal, 
    rolls: allRolls, 
    modifier: detectedModifier, 
    baseTotal,
    expression: roll.output
  };
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
  
  return `🎲 ${result.d20} ${modifierText} = ${result.total}${criticalText}${advantageText}\n> ${result.expression}`;
}
