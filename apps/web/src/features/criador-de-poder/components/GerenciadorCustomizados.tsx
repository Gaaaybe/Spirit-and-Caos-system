import { useState } from 'react';
import { Button, Card, Badge, ConfirmDialog, EmptyState, DynamicIcon } from '../../../shared/ui';
import { MarkdownText } from '../../../shared/components';
import { usePeculiaridades } from '../../../shared/hooks/usePeculiaridades';
import { toast } from '../../../shared/ui';
import { FormPeculiaridadeCustomizada } from './FormPeculiaridadeCustomizada';
import { Trash2, Sparkles, Globe, Lock, Pencil, Plus } from 'lucide-react';
import type { PeculiaridadeResponse } from '../../../services/types';

export function GerenciadorCustomizados() {
  const { peculiaridades, deletar: deletarPeculiaridadeApi, atualizar, criar } = usePeculiaridades();

  const [confirmDeletePeculiar, setConfirmDeletePeculiar] = useState<string | null>(null);
  const [togglePublicId, setTogglePublicId] = useState<string | null>(null);
  const [modalCriar, setModalCriar] = useState(false);
  const [editando, setEditando] = useState<PeculiaridadeResponse | null>(null);

  const handleDeletePeculiaridade = async (id: string) => {
    await deletarPeculiaridadeApi(id);
    setConfirmDeletePeculiar(null);
  };

  const handleTogglePublic = async (peculiar: { id: string; nome: string; isPublic: boolean }) => {
    setTogglePublicId(peculiar.id);
    try {
      await atualizar(peculiar.id, { isPublic: !peculiar.isPublic });
      toast.success(peculiar.isPublic ? `"${peculiar.nome}" agora é privada.` : `"${peculiar.nome}" publicada!`);
    } catch {
      toast.error('Erro ao alterar visibilidade.');
    } finally {
      setTogglePublicId(null);
    }
  };

  const handleCriar = async (data: { nome: string; descricao: string; espiritual: boolean }) => {
    try {
      await criar(data);
      toast.success(`Peculiaridade "${data.nome}" criada!`);
    } catch {
      toast.error('Erro ao criar peculiaridade.');
      throw new Error(); // re-throw para o modal não fechar
    }
  };

  const handleEditar = async (data: { nome: string; descricao: string; espiritual: boolean }) => {
    if (!editando) return;
    try {
      await atualizar(editando.id, data);
      toast.success(`"${data.nome}" atualizada!`);
    } catch {
      toast.error('Erro ao atualizar peculiaridade.');
      throw new Error();
    }
  };

  return (
    <div className="space-y-6">

      {/* Peculiaridades Customizadas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" /> Peculiaridades Customizadas
          </h2>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalCriar(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nova Peculiaridade
          </Button>
        </div>
        {peculiaridades.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-12 h-12 text-gray-400" />}
            title="Nenhuma peculiaridade customizada"
            description="Crie suas próprias peculiaridades aqui ou no Criador de Poderes com domínio Peculiar"
            action={{ label: 'Nova Peculiaridade', onClick: () => setModalCriar(true), icon: <Plus className="w-4 h-4" /> }}
          />
        ) : (
          <div className="grid gap-3">
            {peculiaridades.map((peculiar) => (
              <Card key={peculiar.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {peculiar.icone && <DynamicIcon name={peculiar.icone} className="inline w-4 h-4 mr-1 -mt-0.5" />}{peculiar.nome}
                      </h3>
                      <Badge variant="success">Customizado</Badge>
                      {peculiar.espiritual && <Badge variant="info">Espiritual</Badge>}
                      {peculiar.isPublic && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <Globe className="w-3 h-3" /> Público
                        </span>
                      )}
                    </div>
                    {peculiar.descricao && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-2 text-xs">
                        <div className="text-gray-700 dark:text-gray-300">
                          <MarkdownText>{peculiar.descricao}</MarkdownText>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditando(peculiar)}
                      title="Editar"
                      aria-label={`Editar ${peculiar.nome}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleTogglePublic(peculiar)}
                      title={peculiar.isPublic ? 'Tornar privada' : 'Publicar'}
                      loading={togglePublicId === peculiar.id}
                      disabled={togglePublicId !== null && togglePublicId !== peculiar.id}
                      className={peculiar.isPublic ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
                    >
                      {peculiar.isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDeletePeculiar(peculiar.id)}
                      aria-label={`Deletar ${peculiar.nome}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {confirmDeletePeculiar && (
        <ConfirmDialog
          isOpen={true}
          title="Deletar Peculiaridade Customizada"
          message="Tem certeza que deseja deletar esta peculiaridade? Esta ação não pode ser desfeita. Poderes que usam esta peculiaridade podem ser afetados."
          onConfirm={() => handleDeletePeculiaridade(confirmDeletePeculiar)}
          onClose={() => setConfirmDeletePeculiar(null)}
          variant="danger"
          confirmText="Deletar"
        />
      )}

      {/* Modal Criar */}
      <FormPeculiaridadeCustomizada
        isOpen={modalCriar}
        onClose={() => setModalCriar(false)}
        onSubmit={handleCriar}
      />

      {/* Modal Editar */}
      <FormPeculiaridadeCustomizada
        isOpen={!!editando}
        onClose={() => setEditando(null)}
        onSubmit={handleEditar}
        initialValues={editando ? { nome: editando.nome, descricao: editando.descricao, espiritual: editando.espiritual, icone: editando.icone ?? undefined } : undefined}
        title="Editar Peculiaridade"
        submitLabel="Salvar Alterações"
      />
    </div>
  );
}
