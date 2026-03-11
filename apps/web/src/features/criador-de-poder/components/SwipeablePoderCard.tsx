import { Card, CardContent, Badge, Button } from '../../../shared/ui';
import { useSwipeToDismiss, useIsTouchDevice } from '../../../shared/hooks';
import { Trash2, FolderOpen, Copy, Download, Globe, Lock } from 'lucide-react';
import type { PoderSalvo } from '../types';

interface SwipeablePoderCardProps {
  poder: PoderSalvo;
  isPublic: boolean;
  onCarregar: () => void;
  onDuplicar: () => void;
  onExportar: () => void;
  onDeletar: () => void;
  onTogglePublic: () => void;
  onVerResumo: () => void;
  formatarData: (data: string) => string;
  carregandoId: string | null;
  deletandoId: string | null;
  duplicandoId: string | null;
  exportandoId: string | null;
  togglePublicId: string | null;
}

export function SwipeablePoderCard({
  poder,
  isPublic,
  onCarregar,
  onDuplicar,
  onExportar,
  onDeletar,
  onTogglePublic,
  onVerResumo,
  formatarData,
  carregandoId,
  deletandoId,
  duplicandoId,
  exportandoId,
  togglePublicId
}: SwipeablePoderCardProps) {
  const isTouchDevice = useIsTouchDevice();
  const swipeHandlers = useSwipeToDismiss(onDeletar, 80);

  return (
    <div className="relative overflow-hidden">
      {/* Botão de deletar revelado ao swipe (apenas touch) */}
      {isTouchDevice && (
        <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-600 dark:bg-red-700 px-6">
          <span className="text-white font-semibold flex items-center gap-2"><Trash2 className="w-5 h-5" /> Deletar</span>
        </div>
      )}

      {/* Card principal */}
      <div
        {...(isTouchDevice ? swipeHandlers : {})}
        className="bg-white dark:bg-gray-800"
      >
        <Card hover>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3">
              {/* Cabeçalho com nome e badge — clicável para abrir resumo */}
              <div
                className="flex items-start justify-between gap-3 cursor-pointer"
                onClick={onVerResumo}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base break-words hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {poder.nome}
                  </h3>
                  {isPublic && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 mt-0.5">
                      <Globe className="w-3 h-3" /> Público
                    </span>
                  )}
                </div>
                <Badge variant="secondary" size="sm" className="flex-shrink-0">
                  {poder.efeitos.length} {poder.efeitos.length === 1 ? 'efeito' : 'efeitos'}
                </Badge>
              </div>

              {/* Descrição — clicável */}
              {poder.descricao && (
                <p
                  className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words cursor-pointer"
                  onClick={onVerResumo}
                >
                  {poder.descricao}
                </p>
              )}
              
              {/* Rodapé — linha 1: data + ações secundárias */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-xs text-gray-500 dark:text-gray-500 flex-shrink-0">
                  {formatarData(poder.dataCriacao)}
                </p>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDuplicar}
                    title="Duplicar"
                    loading={duplicandoId === poder.id}
                    disabled={duplicandoId !== null && duplicandoId !== poder.id}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onExportar}
                    title="Exportar JSON"
                    loading={exportandoId === poder.id}
                    disabled={exportandoId !== null && exportandoId !== poder.id}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onTogglePublic}
                    title={isPublic ? 'Tornar privado' : 'Publicar'}
                    loading={togglePublicId === poder.id}
                    disabled={togglePublicId !== null && togglePublicId !== poder.id}
                    className={isPublic ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                  >
                    {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDeletar}
                    className="text-red-500 hover:text-red-700"
                    title="Deletar"
                    loading={deletandoId === poder.id}
                    disabled={deletandoId !== null && deletandoId !== poder.id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Linha 2: Carregar */}
              <Button
                variant="primary"
                size="sm"
                onClick={onCarregar}
                loading={carregandoId === poder.id}
                loadingText="Carregando…"
                className="w-full flex items-center justify-center gap-2"
              >
                <FolderOpen className="w-4 h-4" /> Carregar no Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
