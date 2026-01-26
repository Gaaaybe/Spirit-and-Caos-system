/**
 * Editor de Atributos do Personagem
 * Permite distribuir pontos de atributo com validação
 */

import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Badge } from '../../../shared/ui/Badge';
import type { Attributes } from '../types';

interface AtributosEditorProps {
  attributes: Attributes;
  modificadores: Attributes;
  pontosDisponiveis: number;
  onChangeAtributo: (atributo: keyof Attributes, valor: number) => void;
}

const ATRIBUTOS_INFO: Record<keyof Attributes, { desc: string; cor: string }> = {
  Força: { desc: 'Poder físico e capacidade de carga', cor: 'red' },
  Destreza: { desc: 'Agilidade, reflexos e coordenação', cor: 'green' },
  Constituição: { desc: 'Resistência e vitalidade', cor: 'orange' },
  Inteligência: { desc: 'Raciocínio lógico e memória', cor: 'blue' },
  Sabedoria: { desc: 'Percepção e intuição', cor: 'purple' },
  Carisma: { desc: 'Força de personalidade e liderança', cor: 'pink' },
};

export function AtributosEditor({
  attributes,
  modificadores,
  pontosDisponiveis,
  onChangeAtributo,
}: AtributosEditorProps) {
  const handleIncrement = (attr: keyof Attributes) => {
    if (pontosDisponiveis > 0) {
      onChangeAtributo(attr, attributes[attr] + 1);
    }
  };

  const handleDecrement = (attr: keyof Attributes) => {
    if (attributes[attr] > 1) {
      onChangeAtributo(attr, attributes[attr] - 1);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header com pontos disponíveis */}
        <div className="flex justify-between items-center pb-4 border-b">
          <h3 className="text-xl font-bold">Atributos</h3>
          <div className="text-right">
            <p className="text-sm text-gray-600">Pontos Disponíveis</p>
            <Badge variant={pontosDisponiveis > 0 ? 'success' : 'secondary'} className="text-lg">
              {pontosDisponiveis}
            </Badge>
          </div>
        </div>

        {/* Grid de atributos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(attributes) as Array<keyof Attributes>).map((attr) => (
            <Card key={attr} className="p-4 bg-gray-50">
              <div className="space-y-2">
                {/* Nome e descrição */}
                <div>
                  <h4 className="font-bold text-lg">{attr}</h4>
                  <p className="text-xs text-gray-600">{ATRIBUTOS_INFO[attr].desc}</p>
                </div>

                {/* Controles */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDecrement(attr)}
                    disabled={attributes[attr] <= 1}
                    className="w-8 h-8 rounded bg-red-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600"
                  >
                    −
                  </button>

                  <Input
                    type="number"
                    value={attributes[attr]}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      if (val >= 1) {
                        onChangeAtributo(attr, val);
                      }
                    }}
                    min={1}
                    className="w-16 text-center font-bold text-xl"
                  />

                  <button
                    onClick={() => handleIncrement(attr)}
                    disabled={pontosDisponiveis <= 0}
                    className="w-8 h-8 rounded bg-green-500 text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600"
                  >
                    +
                  </button>

                  {/* Modificador */}
                  <div className="ml-auto text-right">
                    <p className="text-xs text-gray-600">Modificador</p>
                    <Badge
                      variant={modificadores[attr] >= 0 ? 'success' : 'warning'}
                      className="text-lg font-mono"
                    >
                      {modificadores[attr] >= 0 ? '+' : ''}
                      {modificadores[attr]}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Avisos */}
        {pontosDisponiveis < 0 && (
          <div className="p-3 bg-red-100 text-red-800 rounded text-sm">
            ⚠️ Você está usando {Math.abs(pontosDisponiveis)} pontos a mais do que deveria!
          </div>
        )}
      </div>
    </Card>
  );
}
