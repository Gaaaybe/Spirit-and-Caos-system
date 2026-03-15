/**
 * Display de Orçamento de PdA e Espaços
 * Mostra total, usado e disponível com avisos visuais
 */

import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { Lightbulb } from 'lucide-react';

interface OrcamentoPdAProps {
  // PdA
  pdaTotal: number;
  pdaUsado: number;
  
  // Espaços
  espacosTotal: number;
  espacosUsado: number;
}

export function OrcamentoPdA({
  pdaTotal,
  pdaUsado,
  espacosTotal,
  espacosUsado,
}: OrcamentoPdAProps) {
  const pdaDisponivel = pdaTotal - pdaUsado;
  const espacosDisponivel = espacosTotal - espacosUsado;
  
  const pdaExcedido = pdaUsado > pdaTotal;
  const espacosExcedido = espacosUsado > espacosTotal;
  
  const pdaProximoLimite = pdaUsado / pdaTotal > 0.8;
  const espacosProximoLimite = espacosUsado / espacosTotal > 0.8;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-bold mb-4">Orçamento de Recursos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PdA */}
        <div className={`p-4 rounded-lg border-2 transition-colors ${
          pdaExcedido
            ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
            : pdaProximoLimite
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
            : 'bg-green-50 dark:bg-green-950/20 border-green-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">Pontos de Ataque (PdA)</h4>
            {pdaExcedido && (
              <Badge variant="warning" size="sm">Excedido!</Badge>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Total:</span>
              <span className="font-bold">{pdaTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Usado:</span>
              <span className={`font-bold ${pdaExcedido ? 'text-red-600 dark:text-red-400' : ''}`}>
                {pdaUsado}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300">Disponível:</span>
              <span className={`font-bold text-lg ${
                pdaExcedido
                  ? 'text-red-600 dark:text-red-400'
                  : pdaProximoLimite
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {pdaDisponivel}
              </span>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-3 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                pdaExcedido
                  ? 'bg-red-500'
                  : pdaProximoLimite
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (pdaUsado / pdaTotal) * 100)}%` }}
            />
          </div>
          
          {pdaExcedido && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              ⚠️ Você excedeu o orçamento de PdA!
            </p>
          )}
        </div>

        {/* Espaços */}
        <div className={`p-4 rounded-lg border-2 transition-colors ${
          espacosExcedido
            ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
            : espacosProximoLimite
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold">Espaços</h4>
            {espacosExcedido && (
              <Badge variant="warning" size="sm">Excedido!</Badge>
            )}
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Total:</span>
              <span className="font-bold">{espacosTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Usado (ativos):</span>
              <span className={`font-bold ${espacosExcedido ? 'text-red-600 dark:text-red-400' : ''}`}>
                {espacosUsado}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t dark:border-slate-700">
              <span className="text-gray-700 dark:text-gray-300">Disponível:</span>
              <span className={`font-bold text-lg ${
                espacosExcedido
                  ? 'text-red-600 dark:text-red-400'
                  : espacosProximoLimite
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {espacosDisponivel}
              </span>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="mt-3 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                espacosExcedido
                  ? 'bg-red-500'
                  : espacosProximoLimite
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, (espacosUsado / espacosTotal) * 100)}%` }}
            />
          </div>
          
          {espacosExcedido && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
              ⚠️ Você excedeu o limite de espaços!
            </p>
          )}
          
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-500" />
            <span>Apenas poderes ativos consomem espaços</span>
          </p>
        </div>
      </div>
      
      {/* Avisos gerais */}
      {(pdaExcedido || espacosExcedido) && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
          <strong>⚠️ Atenção:</strong> Seu personagem excedeu os recursos disponíveis.
          Desative ou remova poderes para voltar aos limites permitidos.
        </div>
      )}
    </Card>
  );
}
