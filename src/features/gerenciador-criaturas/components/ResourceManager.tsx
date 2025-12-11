import { useState } from 'react';
import { Heart, Zap, Crown, Minus, Plus, RotateCcw } from 'lucide-react';
import { Button, Input } from '../../../shared/ui';
import type { Creature } from '../types';

interface ResourceManagerProps {
  creature: Creature;
  onUpdateResources: (updates: {
    hp?: number;
    pe?: number;
    sovereignty?: number;
  }) => void;
}

/**
 * ResourceManager
 * 
 * Gerencia HP, PE e Soberania de uma criatura.
 * Permite aplicar dano/cura e gastar/recuperar recursos.
 */
export function ResourceManager({ creature, onUpdateResources }: ResourceManagerProps) {
  const [hpInput, setHpInput] = useState('');
  const [peInput, setPeInput] = useState('');

  const handleApplyDamage = () => {
    const damage = parseInt(hpInput);
    if (isNaN(damage) || damage <= 0) return;
    
    const newHp = Math.max(0, creature.stats.hp - damage);
    onUpdateResources({ hp: newHp });
    setHpInput('');
  };

  const handleHeal = () => {
    const healing = parseInt(hpInput);
    if (isNaN(healing) || healing <= 0) return;
    
    const newHp = Math.min(creature.stats.maxHp, creature.stats.hp + healing);
    onUpdateResources({ hp: newHp });
    setHpInput('');
  };

  const handleSpendPE = () => {
    const cost = parseInt(peInput);
    if (isNaN(cost) || cost <= 0) return;
    
    const newPe = Math.max(0, creature.stats.pe - cost);
    onUpdateResources({ pe: newPe });
    setPeInput('');
  };

  const handleRecoverPE = () => {
    const recovery = parseInt(peInput);
    if (isNaN(recovery) || recovery <= 0) return;
    
    const newPe = Math.min(creature.stats.maxPe, creature.stats.pe + recovery);
    onUpdateResources({ pe: newPe });
    setPeInput('');
  };

  const handleResetHP = () => {
    onUpdateResources({ hp: creature.stats.maxHp });
  };

  const handleResetPE = () => {
    onUpdateResources({ pe: creature.stats.maxPe });
  };

  const handleSpendSovereignty = () => {
    if (!creature.bossMechanics) return;
    const newSov = Math.max(0, creature.bossMechanics.sovereignty - 1);
    onUpdateResources({ sovereignty: newSov });
  };

  const handleRecoverSovereignty = () => {
    if (!creature.bossMechanics) return;
    const newSov = Math.min(
      creature.bossMechanics.sovereigntyMax,
      creature.bossMechanics.sovereignty + 1
    );
    onUpdateResources({ sovereignty: newSov });
  };

  const handleResetSovereignty = () => {
    if (!creature.bossMechanics) return;
    onUpdateResources({ sovereignty: creature.bossMechanics.sovereigntyMax });
  };

  const hpPercentage = (creature.stats.hp / creature.stats.maxHp) * 100;
  const pePercentage = (creature.stats.pe / creature.stats.maxPe) * 100;

  return (
    <div className="space-y-4">
      {/* HP */}
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="font-bold text-gray-900 dark:text-gray-100">Pontos de Vida</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetHP}
            disabled={creature.stats.hp === creature.stats.maxHp}
            className="gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar
          </Button>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {creature.stats.hp}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              / {creature.stats.maxHp}
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-300"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            value={hpInput}
            onChange={(e) => setHpInput(e.target.value)}
            placeholder="Valor"
            min={0}
            className="flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleApplyDamage}
            disabled={!hpInput}
            className="gap-1"
          >
            <Minus className="w-4 h-4" />
            Dano
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleHeal}
            disabled={!hpInput}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Curar
          </Button>
        </div>
      </div>

      {/* PE */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-gray-900 dark:text-gray-100">Pontos de Esforço</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleResetPE}
            disabled={creature.stats.pe === creature.stats.maxPe}
            className="gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Restaurar
          </Button>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {creature.stats.pe}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              / {creature.stats.maxPe}
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${pePercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Unidade de Esforço: {creature.stats.effortUnit} PE
          </p>
        </div>

        <div className="flex gap-2">
          <Input
            type="number"
            value={peInput}
            onChange={(e) => setPeInput(e.target.value)}
            placeholder="Valor"
            min={0}
            className="flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSpendPE}
            disabled={!peInput}
            className="gap-1"
          >
            <Minus className="w-4 h-4" />
            Gastar
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRecoverPE}
            disabled={!peInput}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Recuperar
          </Button>
        </div>
      </div>

      {/* Soberania (apenas para chefes) */}
      {creature.bossMechanics && (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="font-bold text-gray-900 dark:text-gray-100">Soberania</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleResetSovereignty}
              disabled={creature.bossMechanics.sovereignty === creature.bossMechanics.sovereigntyMax}
              className="gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar
            </Button>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {creature.bossMechanics.sovereignty}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                / {creature.bossMechanics.sovereigntyMax}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Ações extras disponíveis
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSpendSovereignty}
              disabled={creature.bossMechanics.sovereignty === 0}
              className="flex-1 gap-1"
            >
              <Minus className="w-4 h-4" />
              Usar Ação
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRecoverSovereignty}
              disabled={creature.bossMechanics.sovereignty === creature.bossMechanics.sovereigntyMax}
              className="flex-1 gap-1"
            >
              <Plus className="w-4 h-4" />
              Recuperar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
