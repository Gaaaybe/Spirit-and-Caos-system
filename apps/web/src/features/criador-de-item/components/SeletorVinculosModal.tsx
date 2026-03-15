import { useMemo, useState } from 'react';
import { Search, Link2, Eye, Sparkles } from 'lucide-react';
import { Modal, ModalFooter, Button, Badge, Input, DynamicIcon } from '@/shared/ui';

interface VinculoOption {
  id: string;
  nome: string;
  descricao: string;
  dominio: string;
  icone?: string | null;
}

interface SeletorVinculosModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  emptyText: string;
  options: VinculoOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onOpenDetails?: (id: string) => void;
}

export function SeletorVinculosModal({
  isOpen,
  onClose,
  title,
  emptyText,
  options,
  selectedIds,
  onToggle,
  onOpenDetails,
}: SeletorVinculosModalProps) {
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return options;
    }

    return options.filter((option) => {
      return (
        option.nome.toLowerCase().includes(termo) ||
        option.descricao.toLowerCase().includes(termo)
      );
    });
  }, [busca, options]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Badge variant="secondary">{selectedIds.length} vinculados</Badge>
          <span>{filtrados.length} resultados</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
          {filtrados.length === 0 ? (
            <p className="text-sm text-gray-500">{emptyText}</p>
          ) : (
            filtrados.map((option) => {
              const isSelected = selectedIds.includes(option.id);

              return (
                <div
                  key={option.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-900/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex items-start gap-2">
                      <div className="w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        {option.icone ? (
                          <DynamicIcon name={option.icone} className="w-full h-full" />
                        ) : (
                          <Sparkles className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {option.nome}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {option.descricao}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Domínio: {option.dominio}
                      </p>
                    </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      {onOpenDetails ? (
                        <Button size="sm" variant="ghost" onClick={() => onOpenDetails(option.id)}>
                          <Eye className="w-3.5 h-3.5 mr-1" /> Resumo
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant={isSelected ? 'secondary' : 'outline'}
                        onClick={() => onToggle(option.id)}
                      >
                        <Link2 className="w-3.5 h-3.5 mr-1" />
                        {isSelected ? 'Vinculado' : 'Vincular'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </ModalFooter>
    </Modal>
  );
}