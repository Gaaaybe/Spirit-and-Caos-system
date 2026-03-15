/**
 * Lista de Poderes do Personagem
 * Cards com ações: ativar/desativar, remover, ver detalhes
 */

import { useState, useMemo } from 'react';
import type { PersonagemPoder } from '../types';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { DynamicIcon } from '../../../shared/ui/DynamicIcon';
import { ResumoPoder } from '../../criador-de-poder/components/ResumoPoder';
import { calcularDetalhesPoder } from '../../criador-de-poder/regras/calculadoraCusto';
import { useCatalog } from '../../../context/useCatalog';
import { Zap } from 'lucide-react';

interface ListaPoderesProps {
  poderes: PersonagemPoder[];
  onAlternarAtivo: (poderId: string) => void;
  onRemover: (poderId: string) => void;
}

export function ListaPoderes({
  poderes,
  onAlternarAtivo,
  onRemover,
}: ListaPoderesProps) {
  const { efeitos, modificacoes } = useCatalog();
  const [detalhesPoderAberto, setDetalhesPoderAberto] = useState<PersonagemPoder | null>(null);

  const powerDetailsForModal = useMemo(() => {
    if (!detalhesPoderAberto) return null;
    return calcularDetalhesPoder(detalhesPoderAberto.poder, efeitos, modificacoes);
  }, [detalhesPoderAberto, efeitos, modificacoes]);

  const handleRemover = (poder: PersonagemPoder) => {
    if (confirm(`Deseja realmente remover o poder "${poder.poder.nome}"?`)) {
      onRemover(poder.id);
    }
  };

  if (poderes.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">Nenhum poder adicionado ainda</p>
          <p className="text-sm mt-1">
            Clique em "Adicionar Poder" para vincular poderes da biblioteca
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {poderes.map((poder) => (
        <div
          key={poder.id}
          className={`p-3 border rounded-lg transition-all ${
            poder.ativo
              ? 'bg-green-50 dark:bg-green-950/20 border-green-300 dark:border-green-800'
              : 'bg-gray-50 dark:bg-slate-800/50 border-gray-300 dark:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Nome e Status */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-md overflow-hidden bg-white/50 dark:bg-gray-700/50 flex items-center justify-center flex-shrink-0">
                  {poder.poder.icone ? (
                    <DynamicIcon name={poder.poder.icone} className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  )}
                </div>
                <h5 className="font-bold truncate">{poder.poder.nome}</h5>
                {poder.ativo ? (
                  <Badge variant="success" size="sm">Ativo</Badge>
                ) : (
                  <Badge variant="secondary" size="sm">Inativo</Badge>
                )}
              </div>

              {/* Descrição */}
              {poder.poder.descricao && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {poder.poder.descricao}
                </p>
              )}

              {/* Estatísticas */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">PdA:</span>
                  <span className="ml-1 font-semibold">{poder.pdaCost}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Espaços:</span>
                  <span className="ml-1 font-semibold">{poder.espacosOccupied}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Efeitos:</span>
                  <span className="ml-1 font-semibold">{poder.poder.efeitos.length}</span>
                </div>
                {poder.usosRestantes !== undefined && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Usos:</span>
                    <span className="ml-1 font-semibold">{poder.usosRestantes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant={poder.ativo ? 'secondary' : 'primary'}
                onClick={() => onAlternarAtivo(poder.id)}
              >
                {poder.ativo ? 'Desativar' : 'Ativar'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetalhesPoderAberto(poder)}
              >
                Detalhes
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleRemover(poder)}
              >
                Remover
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal de Detalhes - Usando ResumoPoder */}
      {detalhesPoderAberto && powerDetailsForModal && (
        <ResumoPoder
          isOpen={true}
          onClose={() => setDetalhesPoderAberto(null)}
          poder={detalhesPoderAberto.poder}
          detalhes={powerDetailsForModal}
        />
      )}
    </div>
  );
}
