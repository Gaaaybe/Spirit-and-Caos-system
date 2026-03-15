import { useState } from 'react';
import { Dices, X, Target, Plus, Minus, Zap, RefreshCcw, Sparkles } from 'lucide-react';
import { Button, Badge } from '../../../shared/ui';
import { rollD20, rollDamage, type RollResult } from '../../../shared/utils/diceRoller';
import type { AttackEntry, DamageEntry, Attributes } from '../types';

interface AttackRollerModalProps {
  attack: AttackEntry;
  attributes: Attributes;
  modificadores: Attributes;
  bonusEficiencia: number;
  onClose: () => void;
}

interface DamageRollResult {
  damage: DamageEntry;
  total: number;
  baseTotal: number;
  rolls: number[];
  modifier: number;
  isCrit: boolean;
}

export function AttackRollerModal({
  attack,
  attributes,
  modificadores,
  bonusEficiencia,
  onClose,
}: AttackRollerModalProps) {
  const [advantage, setAdvantage] = useState<number>(0);
  const [attackRoll, setAttackRoll] = useState<RollResult | null>(null);
  const [damageRolls, setDamageRolls] = useState<DamageRollResult[] | null>(null);

  // Calcular modificador de ataque
  const attrMod = attack.attribute ? modificadores[attack.attribute] : 0;
  const effBonus = attack.useEfficiency ? bonusEficiencia : 0;
  const totalAttackBonus = attrMod + effBonus + attack.miscBonus;

  const handleRollAttack = () => {
    const result = rollD20(totalAttackBonus, advantage);
    
    // Calcula o menor crit range dentre todos os danos do ataque para saber se brilhou no acerto
    const lowestCritRange = attack.damages.length > 0 
      ? Math.min(...attack.damages.map(d => d.critRange)) 
      : 20;
      
    // Estende o conceito de isCritical apenas visualmente para a tela de acerto
    const visualCritical = !result.isFumble && result.d20 >= lowestCritRange;

    setAttackRoll({
      ...result,
      isCritical: visualCritical // Força o visual de crítico se atingiu alguma margem
    });
    setDamageRolls(null);
  };

  const handleRollDamage = () => {
    if (!attackRoll) return;

    const d20 = attackRoll.d20;
    
    const rolls = attack.damages.map(dmg => {
      // Crit validation uses the original logic per damage type
      const isCrit = !attackRoll.isFumble && d20 >= dmg.critRange;
      const multiplier = isCrit ? dmg.critMultiplier : 1;
      
      const dmgResult = rollDamage(dmg.formula, multiplier);
      
      return {
        damage: dmg,
        total: dmgResult.total,
        baseTotal: dmgResult.baseTotal,
        rolls: dmgResult.rolls,
        modifier: dmgResult.modifier,
        isCrit,
      };
    });

    setDamageRolls(rolls);
  };

  const handleReset = () => {
    setAttackRoll(null);
    setDamageRolls(null);
    setAdvantage(0);
  };

  const totalDamage = damageRolls?.reduce((acc, curr) => acc + curr.total, 0) || 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {attack.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rolagem de Ataque
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full !p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Configuração antes da rolagem */}
        {!attackRoll && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Bônus Total de Acerto</span>
                <Badge variant={totalAttackBonus >= 0 ? 'success' : 'warning'} className="text-lg px-3">
                  {totalAttackBonus >= 0 ? '+' : ''}{totalAttackBonus}
                </Badge>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2 gap-y-1 mt-2">
                {attack.attribute && <span>{attack.attribute}: {attrMod > 0 ? '+' : ''}{attrMod}</span>}
                {attack.useEfficiency && <span>Eficiência: +{effBonus}</span>}
                {attack.miscBonus !== 0 && <span>Misc: {attack.miscBonus > 0 ? '+' : ''}{attack.miscBonus}</span>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Vantagem / Desvantagem
              </label>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <Button 
                  variant={advantage < 0 ? "danger" : "outline"} 
                  size="sm" 
                  onClick={() => setAdvantage(Math.max(-7, advantage - 1))}
                  className="w-12 h-10"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <div className="flex flex-col items-center min-w-[120px]">
                  <span className="font-bold text-lg">
                    {advantage === 0 && 'Normal'}
                    {advantage > 0 && `Vantagem x${advantage}`}
                    {advantage < 0 && `Desvantagem x${Math.abs(advantage)}`}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {advantage !== 0 ? `Rola ${Math.abs(advantage) + 1} dados` : 'Rola 1 dado'}
                  </span>
                </div>

                <Button 
                  variant={advantage > 0 ? "success" : "outline"} 
                  size="sm" 
                  onClick={() => setAdvantage(Math.min(7, advantage + 1))}
                  className="w-12 h-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleRollAttack} variant="primary" className="w-full h-14 text-lg mt-4 shadow-lg shadow-blue-500/20">
              <Dices className="w-5 h-5 mr-2" /> Rolar Ataque
            </Button>
          </div>
        )}

        {/* Resultado do Ataque */}
        {attackRoll && (
          <div className="space-y-4">
            <div className={`p-5 rounded-xl border-2 transition-all relative overflow-hidden ${
              attackRoll.d20 === 20 
                ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                : attackRoll.isCritical 
                ? 'bg-green-50 dark:bg-green-950/30 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                : attackRoll.isFumble 
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-500'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700'
            }`}>
              
              {/* Efeito visual de fundo para crítico */}
              {attackRoll.d20 === 20 && (
                <div className="absolute inset-0 bg-yellow-500/15 dark:bg-yellow-400/15 animate-pulse pointer-events-none" />
              )}
              {attackRoll.isCritical && attackRoll.d20 !== 20 && (
                <div className="absolute inset-0 bg-green-500/10 dark:bg-green-400/10 animate-pulse pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-2 relative z-10">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Teste de Acerto</p>
                {advantage !== 0 && (
                  <Badge variant={advantage > 0 ? "success" : "warning"} size="sm">
                    {advantage > 0 ? `Vantagem x${advantage}` : `Desvantagem x${Math.abs(advantage)}`}
                  </Badge>
                )}
              </div>
              
              <div className="text-center py-2 relative z-10">
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-5xl font-black ${
                    attackRoll.d20 === 20 ? 'text-yellow-600 dark:text-yellow-400' :
                    attackRoll.isCritical ? 'text-green-600 dark:text-green-400' :
                    attackRoll.isFumble ? 'text-red-600 dark:text-red-400' :
                    'text-slate-900 dark:text-white'
                  }`}>
                    {attackRoll.total}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Dado: <strong className={attackRoll.d20 === 20 ? 'text-yellow-600 dark:text-yellow-400 text-lg' : attackRoll.isCritical ? 'text-green-600 dark:text-green-400 text-lg' : attackRoll.isFumble ? 'text-red-600 dark:text-red-400 text-lg' : ''}>{attackRoll.d20}</strong> 
                  {' '}+{totalAttackBonus} bônus
                </p>
                
                {advantage !== 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Rolagens: [{attackRoll.allRolls.join(', ')}]
                  </p>
                )}
                
                {attackRoll.d20 === 20 && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-yellow-600 dark:text-yellow-400 font-black bg-yellow-100 dark:bg-yellow-900/40 py-1 px-4 rounded-full inline-flex mx-auto border-2 border-yellow-400 dark:border-yellow-600 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.6)]">
                    <Sparkles className="w-5 h-5 fill-current" />
                    SUCESSO VERDADEIRO!
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                )}
                {attackRoll.isCritical && attackRoll.d20 !== 20 && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-bold bg-green-100 dark:bg-green-900/40 py-1 px-3 rounded-full inline-flex mx-auto border border-green-200 dark:border-green-800">
                    <Zap className="w-4 h-4 fill-current" />
                    CRÍTICO!
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                )}
                {attackRoll.isFumble && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 font-bold bg-red-100 dark:bg-red-900/40 py-1 px-3 rounded-full inline-flex mx-auto border border-red-200 dark:border-red-800">
                    <X className="w-4 h-4" />
                    FALHA CRÍTICA!
                    <X className="w-4 h-4" />
                  </div>
                )}
              </div>
            </div>

            {/* Resultado do Dano */}
            {damageRolls ? (
              <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 border-2 border-orange-500 shadow-[0_4px_15px_rgba(249,115,22,0.15)]">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm font-bold text-orange-900 dark:text-orange-200">Dano Total Causado</p>
                    <span className="text-3xl font-black text-orange-600 dark:text-orange-400">
                      💥 {totalDamage}
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-orange-200 dark:border-orange-800/50 pt-3">
                    {damageRolls.map((dr, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg border border-orange-100 dark:border-orange-900/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                              {dr.total} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({dr.damage.type})</span>
                            </span>
                            {dr.isCrit && (
                              <Badge variant="warning" size="sm" className="bg-yellow-500 text-white font-bold animate-pulse">
                                Crítico (x{dr.damage.critMultiplier})
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              Fórmula: {dr.damage.formula}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Rolado: [{dr.rolls.join(', ')}]{dr.modifier !== 0 ? (dr.modifier > 0 ? ` +${dr.modifier}` : ` ${dr.modifier}`) : ''} 
                              {dr.isCrit ? ` = ${dr.baseTotal} (Base)` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleRollDamage}
                variant="primary"
                className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white border-none shadow-lg shadow-orange-500/30 text-lg font-bold"
              >
                <Zap className="w-5 h-5 mr-2" /> 
                Rolar Danos
              </Button>
            )}

            {/* Ações de Reroll e Reset */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              {damageRolls ? (
                <>
                  <Button onClick={handleRollAttack} variant="outline" className="w-full" size="sm">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Rerolar Ataque
                  </Button>
                  <Button onClick={handleRollDamage} variant="outline" className="w-full border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-900/30" size="sm">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Rerolar Dano
                  </Button>
                </>
              ) : (
                <Button onClick={handleRollAttack} variant="outline" className="w-full col-span-2" size="sm">
                  <RefreshCcw className="w-4 h-4 mr-2" /> Rerolar Ataque
                </Button>
              )}
              
              <Button onClick={handleReset} variant="ghost" className="w-full col-span-2 mt-2 text-slate-500">
                Voltar e Configurar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
