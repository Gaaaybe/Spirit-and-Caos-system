import { useState, useMemo } from 'react';
import { Search, AlertCircle, Sword, Shield, Droplets, Gem, Sparkles, Package, Hammer, Box } from 'lucide-react';
import { Modal, Button, Input, DynamicIcon, Badge } from '@/shared/ui';
import { fetchMyItems } from '@/services/items.service';
import { useEffect } from 'react';
import type { ItemResponse, ItemType } from '@/services/types';

const TYPE_LABELS: Record<ItemType, string> = {
  weapon: 'Arma',
  'defensive-equipment': 'Defesa',
  consumable: 'Consumível',
  artifact: 'Artefato',
  accessory: 'Acessório',
  general: 'Geral',
  'upgrade-material': 'Material',
};

const TYPE_COLORS: Record<ItemType, string> = {
  weapon: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'defensive-equipment': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  consumable: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  artifact: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  accessory: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  general: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'upgrade-material': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

function ItemTypeIcon({ tipo, className }: { tipo: ItemType; className?: string }) {
  const cls = className ?? 'w-6 h-6';
  switch (tipo) {
    case 'weapon': return <Sword className={cls} />;
    case 'defensive-equipment': return <Shield className={cls} />;
    case 'consumable': return <Droplets className={cls} />;
    case 'artifact': return <Gem className={cls} />;
    case 'accessory': return <Sparkles className={cls} />;
    case 'upgrade-material': return <Hammer className={cls} />;
    default: return <Box className={cls} />;
  }
}

const ICON_COLORS: Record<ItemType, string> = {
  weapon: 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 text-red-500',
  'defensive-equipment': 'bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800 text-emerald-500',
  consumable: 'bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800 text-amber-500',
  artifact: 'bg-white dark:bg-gray-900 border-purple-200 dark:border-purple-800 text-purple-500',
  accessory: 'bg-white dark:bg-gray-900 border-cyan-200 dark:border-cyan-800 text-cyan-500',
  general: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-400',
  'upgrade-material': 'bg-white dark:bg-gray-900 border-orange-200 dark:border-orange-800 text-orange-500',
};

const FILTER_TYPES: { value: ItemType | 'tudo'; label: string }[] = [
  { value: 'tudo', label: 'Todos' },
  { value: 'weapon', label: 'Armas' },
  { value: 'defensive-equipment', label: 'Defesa' },
  { value: 'consumable', label: 'Consumíveis' },
  { value: 'artifact', label: 'Artefatos' },
  { value: 'accessory', label: 'Acessórios' },
  { value: 'upgrade-material', label: 'Materiais' },
  { value: 'general', label: 'Gerais' },
];

interface BibliotecaAdicionarItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (itemId: string) => Promise<void>;
  isProcessing: boolean;
}

export function BibliotecaAdicionarItemModal({
  isOpen,
  onClose,
  onAddItem,
  isProcessing,
}: BibliotecaAdicionarItemModalProps) {
  const [items, setItems] = useState<ItemResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<ItemType | 'tudo'>('tudo');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetchMyItems()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let lista = filtro === 'tudo' ? items : items.filter((i) => i.tipo === filtro);
    if (termo) {
      lista = lista.filter(
        (i) =>
          i.nome.toLowerCase().includes(termo) ||
          i.descricao.toLowerCase().includes(termo),
      );
    }
    return lista.sort((a, b) => a.nome.localeCompare(b.nome));
  }, [items, busca, filtro]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar da Biblioteca" size="xl">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar itens..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TYPES.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                filtro === f.value
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {loading ? (
            <div className="py-8 text-center text-gray-500">Carregando biblioteca...</div>
          ) : itensFiltrados.length === 0 ? (
            <div className="py-8 text-center text-gray-500 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-300" />
              <p>Nenhum item encontrado.</p>
            </div>
          ) : (
            itensFiltrados.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-4 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 bg-amber-50/20 dark:bg-amber-900/5 transition-all"
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center border overflow-hidden ${ICON_COLORS[item.tipo]}`}>
                    {item.icone ? (
                      <DynamicIcon name={item.icone} className="w-full h-full object-cover" />
                    ) : (
                      <ItemTypeIcon tipo={item.tipo} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">
                        {item.nome}
                      </h4>
                      <Badge
                        className={`text-[9px] px-1.5 py-0 h-4 shrink-0 border-none ${TYPE_COLORS[item.tipo]}`}
                      >
                        {TYPE_LABELS[item.tipo]}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                      {item.descricao}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-500">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" /> Nv. {item.nivelItem}
                      </span>
                      <span>•</span>
                      <span>{item.valorBase} ᚱ</span>
                      <span>•</span>
                      <span className="uppercase">{item.dominio.name}</span>
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => onAddItem(item.id)}
                  loading={isProcessing}
                  className="shrink-0 h-9 px-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Adicionar
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
