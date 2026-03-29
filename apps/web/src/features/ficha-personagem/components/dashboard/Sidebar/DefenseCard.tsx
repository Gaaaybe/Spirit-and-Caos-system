import { useState } from 'react';
import { CharacterResponse } from '@/services/characters.types';
import { Card, CardContent } from '@/shared/ui';
import { Shield, Swords, ShieldAlert, Dices } from 'lucide-react';
import { DiceRoller } from '@/shared/components/DiceRoller';

interface DefenseCardProps {
  character: CharacterResponse;
}

export function DefenseCard({ character }: DefenseCardProps) {
  const { dodge, baseRD, blockRD } = character.combatStats;
  const [isRolling, setIsRolling] = useState(false);

  return (
    <>
      <Card className="border-none shadow-md bg-white dark:bg-gray-900 overflow-hidden relative group">
        <CardContent className="p-4 grid grid-cols-3 gap-3">
          {/* Esquiva */}
          <div 
            className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20 cursor-pointer hover:border-blue-500/50 transition-all active:scale-95 group/item"
            onClick={() => setIsRolling(true)}
          >
            <Shield className="w-4 h-4 text-blue-500 mb-1 group-hover/item:scale-110 transition-transform" />
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">Esquiva</span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-black text-blue-900 dark:text-blue-100">{dodge >= 0 ? `+${dodge}` : dodge}</span>
              <Dices className="w-3 h-3 text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />
            </div>
          </div>
          
          {/* RD Base (Automatizada) */}
          <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 relative">
            <ShieldAlert className="w-4 h-4 text-red-500 mb-1 shrink-0" />
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter shrink-0">RD Base</span>
            <span className="text-xl font-black text-red-900 dark:text-red-100 leading-none h-6">{baseRD}</span>
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-gray-900" title="Calculado Automaticamente" />
          </div>

          {/* RD Bloqueio */}
          <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20">
            <Swords className="w-4 h-4 text-orange-500 mb-1" />
            <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">Bloqueio</span>
            <span className="text-xl font-black text-orange-900 dark:text-orange-100">{blockRD}</span>
          </div>
        </CardContent>
      </Card>

      <DiceRoller
        isOpen={isRolling}
        onClose={() => setIsRolling(false)}
        label="Teste de Esquiva"
        modifier={dodge}
        modifierLabel="Bônus de Esquiva"
      />
    </>
  );
}
