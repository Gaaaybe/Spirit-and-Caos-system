/**
 * Painel de Vitais (PV/PE)
 * Controla vida e energia do personagem
 */

import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import type { Vitals } from '../types';

interface VitaisPanelProps {
  vitals: Vitals;
  pvMax: number;
  peMax: number;
  onUpdatePV: (current: number, temp?: number) => void;
  onUpdatePE: (current: number, temp?: number) => void;
  onUpdateDeathCounters: (count: number) => void;
}

export function VitaisPanel({
  vitals,
  pvMax,
  peMax,
  onUpdatePV,
  onUpdatePE,
  onUpdateDeathCounters,
}: VitaisPanelProps) {
  const pvPercentage = Math.min(
    100,
    ((vitals.pv.current + vitals.pv.temp) / (pvMax + vitals.pv.temp)) * 100
  );
  const pePercentage = Math.min(100, (vitals.pe.current / peMax) * 100);

  const handleDano = (tipo: 'pv' | 'pe', valor: number) => {
    if (tipo === 'pv') {
      const novoPV = Math.max(0, vitals.pv.current - valor);
      onUpdatePV(novoPV, vitals.pv.temp);
    } else {
      const novoPE = Math.max(0, vitals.pe.current - valor);
      onUpdatePE(novoPE, vitals.pe.temp);
    }
  };

  const handleCura = (tipo: 'pv' | 'pe', valor: number) => {
    if (tipo === 'pv') {
      const novoPV = Math.min(pvMax, vitals.pv.current + valor);
      onUpdatePV(novoPV, vitals.pv.temp);
    } else {
      const novoPE = Math.min(peMax, vitals.pe.current + valor);
      onUpdatePE(novoPE, vitals.pe.temp);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Vitais</h3>

        {/* PV - Pontos de Vida */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Pontos de Vida (PV)</h4>
            <span className="text-sm text-gray-600">
              {vitals.pv.current}
              {vitals.pv.temp > 0 && <span className="text-blue-600"> +{vitals.pv.temp}</span>} /{' '}
              {pvMax}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                pvPercentage > 50
                  ? 'bg-green-500'
                  : pvPercentage > 25
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${pvPercentage}%` }}
            />
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            <Input
              type="number"
              value={vitals.pv.current}
              onChange={(e) => onUpdatePV(parseInt(e.target.value) || 0, vitals.pv.temp)}
              min={0}
              max={pvMax}
              className="w-20"
            />
            <Button onClick={() => handleDano('pv', 5)} variant="danger" size="sm">
              -5
            </Button>
            <Button onClick={() => handleDano('pv', 1)} variant="danger" size="sm">
              -1
            </Button>
            <Button onClick={() => handleCura('pv', 1)} variant="primary" size="sm">
              +1
            </Button>
            <Button onClick={() => handleCura('pv', 5)} variant="primary" size="sm">
              +5
            </Button>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Temp</label>
              <Input
                type="number"
                value={vitals.pv.temp || 0}
                onChange={(e) => onUpdatePV(vitals.pv.current, parseInt(e.target.value) || 0)}
                min={0}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* PE - Pontos de Energia */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Pontos de Energia (PE)</h4>
            <span className="text-sm text-gray-600">
              {vitals.pe.current}
              {vitals.pe.temp > 0 && <span className="text-blue-600"> +{vitals.pe.temp}</span>} /{' '}
              {peMax}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${pePercentage}%` }}
            />
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            <Input
              type="number"
              value={vitals.pe.current}
              onChange={(e) => onUpdatePE(parseInt(e.target.value) || 0, vitals.pe.temp)}
              min={0}
              max={peMax}
              className="w-20"
            />
            <Button onClick={() => handleDano('pe', 5)} variant="danger" size="sm">
              -5
            </Button>
            <Button onClick={() => handleDano('pe', 1)} variant="danger" size="sm">
              -1
            </Button>
            <Button onClick={() => handleCura('pe', 1)} variant="primary" size="sm">
              +1
            </Button>
            <Button onClick={() => handleCura('pe', 5)} variant="primary" size="sm">
              +5
            </Button>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">Temp</label>
              <Input
                type="number"
                value={vitals.pe.temp || 0}
                onChange={(e) => onUpdatePE(vitals.pe.current, parseInt(e.target.value) || 0)}
                min={0}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* Contadores da Morte */}
        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-bold">Contadores da Morte</h4>
          <div className="flex gap-2 items-center">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => onUpdateDeathCounters(i)}
                className={`w-12 h-12 rounded-full border-2 ${
                  vitals.deathCounters >= i
                    ? 'bg-red-500 border-red-700'
                    : 'bg-gray-200 border-gray-400'
                }`}
              >
                {i}
              </button>
            ))}
            <Badge variant={vitals.deathCounters >= 3 ? 'warning' : 'secondary'} className="ml-2">
              {vitals.deathCounters}/3
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
