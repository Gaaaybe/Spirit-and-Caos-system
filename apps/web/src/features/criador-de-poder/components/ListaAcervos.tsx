import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, EmptyState, toast, DynamicIcon } from '../../../shared/ui';
import { usePowerArrays } from '../hooks/usePowerArrays';
import { CriadorAcervo } from './CriadorAcervo';
import { ResumoAcervo } from './ResumoAcervo';
import { acervoResponseToAcervo } from '../utils/poderApiConverter';
import type { Acervo } from '../types/acervo.types';
import type { AcervoResponse } from '../../../services/types';
import { Package, Plus, Search, Globe, Lock } from 'lucide-react';

export function ListaAcervos() {
  const { acervos, deletar, atualizar, carregar } = usePowerArrays();
  const [busca, setBusca] = useState('');
  const [modalCriar, setModalCriar] = useState(false);
  const [acervoEditando, setAcervoEditando] = useState<Acervo | null>(null);
  const [acervoVisualizando, setAcervoVisualizando] = useState<Acervo | null>(null);
  const [togglePublicId, setTogglePublicId] = useState<string | null>(null);

  const acervosFiltrados = acervos.filter((a: AcervoResponse) =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.descricao.toLowerCase().includes(busca.toLowerCase()),
  );

  const handleDeletar = async (id: string, nome: string) => {
    if (confirm(`Tem certeza que deseja deletar o acervo "${nome}"?`)) {
      try {
        await deletar(id);
        toast.success(`Acervo "${nome}" deletado.`);
      } catch {
        toast.error(`Erro ao deletar acervo "${nome}".`);
      }
    }
  };

  const handleTogglePublic = async (acervo: AcervoResponse) => {
    setTogglePublicId(acervo.id);
    try {
      await atualizar(acervo.id, { isPublic: !acervo.isPublic });
      toast.success(acervo.isPublic ? `"${acervo.nome}" agora é privado.` : `"${acervo.nome}" publicado!`);
    } catch {
      toast.error('Erro ao alterar visibilidade.');
    } finally {
      setTogglePublicId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" /> Acervos de Poderes
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {acervos.length} {acervos.length === 1 ? 'acervo' : 'acervos'}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModalCriar(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Novo Acervo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {acervos.length > 0 && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={busca}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusca(e.target.value)}
                  placeholder="Buscar acervos..."
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {acervosFiltrados.length === 0 && busca ? (
            <EmptyState
              icon={<Search className="w-12 h-12 text-gray-400" />}
              title="Nenhum acervo encontrado"
              description={`Nenhum acervo corresponde à busca "${busca}"`}
            />
          ) : acervos.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12 text-gray-400" />}
              title="Nenhum acervo criado"
              description="Acervos são conjuntos de poderes com descritor comum. Crie seu primeiro acervo!"
              action={{
                label: 'Criar Acervo',
                onClick: () => setModalCriar(true),
                icon: <Plus className="w-4 h-4" />

              }}
            />
          ) : (
            <div className="space-y-3">
              {acervosFiltrados.map((acervo) => (
                <Card 
                  key={acervo.id} 
                  className="p-3 cursor-pointer hover:shadow-md transition-shadow min-h-[11rem]"
                  onClick={() => setAcervoVisualizando(acervoResponseToAcervo(acervo))}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          {acervo.icone ? (
                            <DynamicIcon name={acervo.icone} className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                          ) : (
                            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                            {acervo.nome}
                          </h3>
                        </div>
                        {acervo.isPublic && (
                          <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <Globe className="w-3 h-3" /> Público
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span className="font-medium">Descritor:</span> {acervo.descricao}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {acervo.powers.length} {acervo.powers.length === 1 ? 'poder' : 'poderes'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setAcervoEditando(acervoResponseToAcervo(acervo))}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleTogglePublic(acervo)}
                        title={acervo.isPublic ? 'Tornar privado' : 'Publicar'}
                        loading={togglePublicId === acervo.id}
                        disabled={togglePublicId !== null && togglePublicId !== acervo.id}
                        className={acervo.isPublic ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                      >
                        {acervo.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeletar(acervo.id, acervo.nome)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Criar/Editar */}
      <CriadorAcervo
        isOpen={modalCriar || !!acervoEditando}
        onClose={() => {
          setModalCriar(false);
          setAcervoEditando(null);
        }}
        acervoInicial={acervoEditando || undefined}
        onSalvo={carregar}
      />

      {/* Modal Resumo/Visualização */}
      <ResumoAcervo
        isOpen={!!acervoVisualizando}
        onClose={() => setAcervoVisualizando(null)}
        acervo={acervoVisualizando}
      />
    </div>
  );
}
