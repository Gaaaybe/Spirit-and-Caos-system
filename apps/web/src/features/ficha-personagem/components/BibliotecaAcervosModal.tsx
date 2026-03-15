import { useState, useMemo } from 'react';
import type { Acervo } from '../../criador-de-poder/types/acervo.types';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Card } from '../../../shared/ui/Card';
import { Badge } from '../../../shared/ui/Badge';
import { usePowerArrays } from '../../criador-de-poder/hooks/usePowerArrays';
import { acervoResponseToAcervo } from '../../criador-de-poder/utils/poderApiConverter';
import { Search } from 'lucide-react';

interface BibliotecaAcervosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAcervo: (acervo: Acervo) => void;
}

export function BibliotecaAcervosModal({
  isOpen,
  onClose,
  onSelectAcervo,
}: BibliotecaAcervosModalProps) {
  const { acervos: acervosRaw } = usePowerArrays();
  const [busca, setBusca] = useState('');

  const acervos = useMemo(() => acervosRaw.map(acervoResponseToAcervo), [acervosRaw]);

  const acervosFiltrados = useMemo(() => {
    if (!busca) return acervos;
    const termo = busca.toLowerCase();
    return acervos.filter(
      (a) => a.nome.toLowerCase().includes(termo) || a.descritor.toLowerCase().includes(termo)
    );
  }, [acervos, busca]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Acervo ao Personagem" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou descritor..."
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {acervosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum acervo encontrado.</div>
          ) : (
            acervosFiltrados.map((acervo) => (
              <Card key={acervo.id} className="p-3 hover:border-blue-500 dark:hover:border-blue-400 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h4 className="font-bold">{acervo.nome}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{acervo.descritor}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{acervo.poderes.length} Poderes</Badge>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onSelectAcervo(acervo)}>
                    Adicionar
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
