import { Card, CardContent, Button, DynamicIcon } from '@/shared/ui';
import { useSwipeToDismiss, useIsTouchDevice } from '@/shared/hooks';
import { Trash2, Package, Globe, Lock, Edit3, Zap } from 'lucide-react';
import type { AcervoResponse } from '@/services/types';
import { DOMINIO_VISUAL } from './SwipeablePoderCard';

interface SwipeableAcervoCardProps {
  acervo: AcervoResponse;
  onEditar: () => void;
  onDeletar: () => void;
  onTogglePublic: () => void;
  onVerResumo: () => void;
  togglePublicId: string | null;
}

export function SwipeableAcervoCard({
  acervo,
  onEditar,
  onDeletar,
  onTogglePublic,
  onVerResumo,
  togglePublicId,
}: SwipeableAcervoCardProps) {
  const isTouchDevice = useIsTouchDevice();
  const swipeHandlers = useSwipeToDismiss(onDeletar, 80);
  const dominioId = acervo.dominio.name || 'natural';
  const visual = DOMINIO_VISUAL[dominioId] || DOMINIO_VISUAL.natural;

  return (
    <div className="relative overflow-hidden h-full">
      {/* Botão de deletar ao swipe (apenas touch) */}
      {isTouchDevice && (
        <div className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-600 dark:bg-red-700 px-6">
          <span className="text-white font-semibold flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Deletar
          </span>
        </div>
      )}

      <div {...(isTouchDevice ? swipeHandlers : {})} className="bg-white dark:bg-gray-800 h-full">
        <Card
          hover
          className={`h-full min-h-[14rem] border-t-4 ${visual.borderColor} shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden relative cursor-pointer group`}
          onClick={onVerResumo}
        >
          {/* Background Gradient Tint */}
          <div className={`absolute inset-0 bg-gradient-to-b ${visual.gradient} pointer-events-none opacity-40`}></div>

          <CardContent className="p-4 h-full relative z-10 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Icon Container - Padronizado 80x80 */}
                <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50/30 dark:bg-gray-900/20 border border-gray-200/30 dark:border-gray-700/30 group-hover:scale-105 transition-transform shadow-sm">
                  {acervo.icone ? (
                    <DynamicIcon name={acervo.icone} className={`w-14 h-14 ${visual.color}`} />
                  ) : (
                    <Package className={`w-12 h-12 ${visual.color}`} strokeWidth={1.5} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest">{acervo.dominio.name}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight break-words group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {acervo.nome}
                  </h3>
                  {acervo.isPublic && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-bold uppercase mt-1">
                      <Globe className="w-3 h-3" /> Público
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Descrição Curta */}
            {acervo.descricao && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                "{acervo.descricao}"
              </p>
            )}

            <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-100/50 dark:border-gray-800/50">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs font-bold">{acervo.powers.length} Poderes</span>
                </div>
              </div>

              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePublic}
                  title={acervo.isPublic ? 'Tornar privado' : 'Publicar'}
                  loading={togglePublicId === acervo.id}
                  disabled={togglePublicId !== null && togglePublicId !== acervo.id}
                  className={acervo.isPublic ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                >
                  {acervo.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onEditar}
                  title="Editar Acervo"
                  className="h-10 w-10 p-0 shadow-sm"
                >
                  <Edit3 className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDeletar}
                  className="text-red-500 hover:text-red-700 h-10 w-10 p-0"
                  title="Deletar"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
