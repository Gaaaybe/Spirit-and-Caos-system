import { Heart, Zap } from 'lucide-react';
import { CharacterResponse } from '@/services/characters.types';

interface MobileStickyVitalsProps {
  health: CharacterResponse['health'];
  energy: CharacterResponse['energy'];
}

export function MobileStickyVitals({ health, energy }: MobileStickyVitalsProps) {
  const hpPercent = Math.min(100, Math.max(0, (health.currentPV / health.maxPV) * 100));
  const pePercent = Math.min(100, Math.max(0, (energy.currentPE / energy.maxPE) * 100));

  return (
    <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm lg:hidden py-2 px-4 flex items-center justify-between gap-4 transition-all">
      {/* PV */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">PV</span>
          </div>
          <span className="text-[11px] font-black text-gray-900 dark:text-white leading-none">
            {health.currentPV} <span className="text-gray-400">/ {health.maxPV}</span>
            {health.temporaryPV > 0 && <span className="text-blue-500 ml-1">+{health.temporaryPV}</span>}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-red-500 to-rose-600 transition-all rounded-full" style={{ width: `${hpPercent}%` }} />
        </div>
      </div>

      {/* PE */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">PE</span>
          </div>
          <span className="text-[11px] font-black text-gray-900 dark:text-white leading-none">
            {energy.currentPE} <span className="text-gray-400">/ {energy.maxPE}</span>
            {(energy.temporaryPE ?? 0) > 0 && <span className="text-amber-500 ml-1">+{energy.temporaryPE}</span>}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all rounded-full" style={{ width: `${pePercent}%` }} />
        </div>
      </div>
    </div>
  );
}
