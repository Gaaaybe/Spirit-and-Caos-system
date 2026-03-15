import { FlaskConical, FolderOpen, Gem, Globe, Lock, Package, Shield, Sword, Trash2 } from 'lucide-react';
import { Badge, Button, Card, CardContent, DynamicIcon } from '@/shared/ui';
import { useIsTouchDevice, useSwipeToDismiss } from '@/shared/hooks';
import type { ItemResponse } from '@/services/types';

interface SwipeableItemCardProps {
  item: ItemResponse;
  onCarregar: () => void;
  onDeletar: () => void;
  onTogglePublic: () => void;
  onVerResumo: () => void;
  formatarData: (data: string) => string;
  carregandoId: string | null;
  deletandoId: string | null;
  togglePublicId: string | null;
}

function getTipoItemLabel(tipo: ItemResponse['tipo']) {
  const labels: Record<ItemResponse['tipo'], string> = {
    weapon: 'Arma',
    'defensive-equipment': 'Equipamento Defensivo',
    consumable: 'Consumivel',
    artifact: 'Artefato',
    accessory: 'Acessorio',
  };

  return labels[tipo] ?? tipo;
}

function getTipoItemIcon(tipo: ItemResponse['tipo']) {
  if (tipo === 'weapon') return <Sword className="w-4 h-4" />;
  if (tipo === 'defensive-equipment') return <Shield className="w-4 h-4" />;
  if (tipo === 'consumable') return <FlaskConical className="w-4 h-4" />;
  if (tipo === 'artifact') return <Gem className="w-4 h-4" />;
  return <Package className="w-4 h-4" />;
}

export function SwipeableItemCard({
  item,
  onCarregar,
  onDeletar,
  onTogglePublic,
  onVerResumo,
  formatarData,
  carregandoId,
  deletandoId,
  togglePublicId,
}: SwipeableItemCardProps) {
  const isTouchDevice = useIsTouchDevice();
  const swipeHandlers = useSwipeToDismiss(onDeletar, 80);

  return (
    <div className="relative overflow-hidden h-full">
      {isTouchDevice && (
        <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-600 dark:bg-red-700 px-6">
          <span className="text-white font-semibold flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Deletar
          </span>
        </div>
      )}

      <div {...(isTouchDevice ? swipeHandlers : {})} className="bg-white dark:bg-gray-800 h-full">
        <Card hover className="h-full min-h-[18rem]">
          <CardContent className="p-3 h-full">
            <div className="flex flex-col gap-3 h-full">
              <div className="flex items-start justify-between gap-3 cursor-pointer" onClick={onVerResumo}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {item.icone && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center">
                      <DynamicIcon name={item.icone} className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mb-1">
                      {getTipoItemIcon(item.tipo)}
                      <span className="text-xs uppercase tracking-wide">{getTipoItemLabel(item.tipo)}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base break-words hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      {item.nome}
                    </h3>

                    {item.isPublic && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-0.5">
                        <Globe className="w-3 h-3" /> Publico
                      </span>
                    )}
                  </div>
                </div>

                <Badge variant="secondary" size="sm" className="flex-shrink-0">
                  Nivel {item.nivelItem}
                </Badge>
              </div>

              <div className="flex-1 flex flex-col justify-between gap-3">
                {item.descricao ? (
                  <p
                    className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 break-words cursor-pointer min-h-[3rem]"
                    onClick={onVerResumo}
                  >
                    {item.descricao}
                  </p>
                ) : (
                  <div className="min-h-[3rem]" />
                )}

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 min-h-[2.5rem]">
                  <p>Custo Base {item.custoBase} • Venda {item.precoVenda}</p>
                  <p>{item.powerIds.length} poderes • {item.powerArrayIds.length} acervos</p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                  {formatarData(item.createdAt)}
                </p>

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePublic}
                    title={item.isPublic ? 'Tornar privado' : 'Publicar'}
                    loading={togglePublicId === item.id}
                    disabled={togglePublicId !== null && togglePublicId !== item.id}
                    className={item.isPublic ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                  >
                    {item.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDeletar}
                    className="text-red-500 hover:text-red-700"
                    title="Deletar"
                    loading={deletandoId === item.id}
                    disabled={deletandoId !== null && deletandoId !== item.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

<Button
                variant="primary"
                size="sm"
                onClick={onCarregar}
                loading={carregandoId === item.id}
                loadingText="Carregando..."
                className="w-full flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" /> Carregar no Editor
              </Button>
            </div>
            
          </div>
          
          </CardContent>
        </Card>
      </div>
    </div>
  );
}