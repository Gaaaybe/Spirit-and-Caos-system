import { useState } from 'react';
import type { PersonagemAcervo } from '../types';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Badge } from '../../../shared/ui/Badge';
import { DynamicIcon } from '../../../shared/ui/DynamicIcon';
import { ResumoAcervo } from '../../criador-de-poder/components/ResumoAcervo';
import { Package } from 'lucide-react';

interface ListaAcervosProps {
  acervos: PersonagemAcervo[];
  onAlternarAtivo: (acervoId: string) => void;
  onRemover: (acervoId: string) => void;
}

export function ListaAcervos({
  acervos,
  onAlternarAtivo,
  onRemover,
}: ListaAcervosProps) {
  const [detalhesAcervoAberto, setDetalhesAcervoAberto] = useState<PersonagemAcervo | null>(null);

  const handleRemover = (acervo: PersonagemAcervo) => {
    if (confirm(`Deseja realmente remover o acervo "${acervo.acervo.nome}"?`)) {
      onRemover(acervo.id);
    }
  };

  if (!acervos || acervos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg">
        <p>Nenhum acervo vinculado.</p>
        <p className="text-sm">Clique em "Adicionar Acervo" para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {acervos.map((pa) => (
        <Card key={pa.id} className={`p-3 ${!pa.ativo ? 'opacity-60' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                {pa.acervo.icone ? (
                  <DynamicIcon name={pa.acervo.icone} className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                ) : (
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold">{pa.acervo.nome}</h4>
                  {!pa.ativo && <Badge variant="secondary">Inativo</Badge>}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">{pa.acervo.descritor}</p>
                
                <div className="flex gap-2 mt-1 text-xs">
                  <span className="text-gray-500 dark:text-gray-500">{pa.pdaCost} PdA</span>
                  <span className="text-gray-500 dark:text-gray-500">•</span>
                  <span className="text-gray-500 dark:text-gray-500">{pa.espacosOccupied} Espaços</span>
                  <span className="text-gray-500 dark:text-gray-500">•</span>
                  <span className="text-gray-500 dark:text-gray-500">{pa.acervo.poderes.length} Poderes</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button size="sm" variant="outline" onClick={() => setDetalhesAcervoAberto(pa)}>
                Ver Detalhes
              </Button>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={pa.ativo ? "secondary" : "primary"}
                  onClick={() => onAlternarAtivo(pa.id)}
                >
                  {pa.ativo ? 'Desativar' : 'Ativar'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleRemover(pa)}>
                  Remover
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Modal de Detalhes - Usando ResumoAcervo */}
      {detalhesAcervoAberto && (
        <ResumoAcervo
          isOpen={true}
          onClose={() => setDetalhesAcervoAberto(null)}
          acervo={detalhesAcervoAberto.acervo}
        />
      )}
    </div>
  );
}
