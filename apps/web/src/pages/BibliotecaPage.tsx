import { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, toast, EmptyState } from '../shared/ui';
import { usePoderes } from '../features/criador-de-poder/hooks/usePoderes';
import { SwipeablePoderCard } from '../features/criador-de-poder/components/SwipeablePoderCard';
import { GerenciadorCustomizados } from '../features/criador-de-poder/components/GerenciadorCustomizados';
import { ListaAcervos } from '../features/criador-de-poder/components/ListaAcervos';
import { usePowerArrays } from '../features/criador-de-poder/hooks/usePowerArrays';
import { ResumoPoder } from '../features/criador-de-poder/components/ResumoPoder';
import { useItems } from '../features/criador-de-item/hooks/useItems';
import { ResumoItem } from '../features/criador-de-item/components/ResumoItem';
import { ResumoVinculoModal } from '../features/criador-de-item/components/ResumoVinculoModal';
import { SwipeableItemCard } from '../features/criador-de-item/components/SwipeableItemCard';
import { poderResponseToPoderSalvo, poderResponseToPoder, legacyPoderToCreatePayload } from '../features/criador-de-poder/utils/poderApiConverter';
import { calcularDetalhesPoder } from '../features/criador-de-poder/regras/calculadoraCusto';
import { useCatalog } from '../context/useCatalog';
import { useNavigate } from 'react-router-dom';
import { Library, Sparkles, Plus, Package, RefreshCw, AlertCircle, Download, Upload } from 'lucide-react';
import type { PoderResponse, CreatePoderPayload, ItemResponse } from '../services/types';

export function BibliotecaPage() {
  const navigate = useNavigate();
  const { poderes, loading, error, deletar, criar, atualizar, carregar: recarregar } = usePoderes();
  const { acervos } = usePowerArrays();
  const {
    items,
    loading: loadingItens,
    error: erroItens,
    atualizar: atualizarItem,
    deletar: deletarItem,
    carregar: recarregarItens,
  } = useItems();
  const { efeitos, modificacoes } = useCatalog();
  const [poderVisualizando, setPoderVisualizando] = useState<PoderResponse | null>(null);
  const [itemVisualizando, setItemVisualizando] = useState<ItemResponse | null>(null);
  const [itemPoderResumoId, setItemPoderResumoId] = useState<string | null>(null);
  const [itemAcervoResumoId, setItemAcervoResumoId] = useState<string | null>(null);

  const poderVisualizandoConvertido = useMemo(() => {
    if (!poderVisualizando) return null;
    const poder = poderResponseToPoder(poderVisualizando);
    const detalhes = calcularDetalhesPoder(poder, efeitos, modificacoes);
    return { poder, detalhes };
  }, [poderVisualizando, efeitos, modificacoes]);

  const itemPoderesSelecionados = useMemo(
    () => (itemVisualizando ? poderes.filter((poder) => itemVisualizando.powerIds.includes(poder.id)) : []),
    [itemVisualizando, poderes],
  );

  const itemAcervosSelecionados = useMemo(
    () => (itemVisualizando ? acervos.filter((acervo) => itemVisualizando.powerArrayIds.includes(acervo.id)) : []),
    [itemVisualizando, acervos],
  );

  const itemPoderResumoSelecionado = useMemo(
    () => (itemPoderResumoId ? poderes.find((poder) => poder.id === itemPoderResumoId) : undefined),
    [itemPoderResumoId, poderes],
  );

  const itemAcervoResumoSelecionado = useMemo(
    () => (itemAcervoResumoId ? acervos.find((acervo) => acervo.id === itemAcervoResumoId) : undefined),
    [itemAcervoResumoId, acervos],
  );

  const [busca, setBusca] = useState('');
  const [carregandoId, setCarregandoId] = useState<string | null>(null);
  const [deletandoId, setDeletandoId] = useState<string | null>(null);
  const [duplicandoId, setDuplicandoId] = useState<string | null>(null);
  const [exportandoId, setExportandoId] = useState<string | null>(null);
  const [exportandoTodos, setExportandoTodos] = useState(false);
  const [importando, setImportando] = useState(false);
  const [togglePublicId, setTogglePublicId] = useState<string | null>(null);
  const [buscaItens, setBuscaItens] = useState('');
  const [carregandoItemId, setCarregandoItemId] = useState<string | null>(null);
  const [deletandoItemId, setDeletandoItemId] = useState<string | null>(null);
  const [togglePublicItemId, setTogglePublicItemId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [abaAtiva, setAbaAtiva] = useState<'poderes' | 'itens' | 'acervos' | 'customizados'>(() => {
    const saved = localStorage.getItem('biblioteca-aba-ativa');
    return (saved as 'poderes' | 'itens' | 'acervos' | 'customizados') || 'poderes';
  });

  // Persistir aba ativa
  useEffect(() => {
    localStorage.setItem('biblioteca-aba-ativa', abaAtiva);
  }, [abaAtiva]);

  // Converte PoderResponse[] → PoderSalvo[] para exibição no SwipeablePoderCard
  const poderesSalvos = useMemo(() => poderes.map(poderResponseToPoderSalvo), [poderes]);

  const poderesFiltrados = poderesSalvos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.descricao && p.descricao.toLowerCase().includes(busca.toLowerCase())),
  );

  const itensFiltrados = useMemo(
    () =>
      items.filter(
        (item) =>
          item.nome.toLowerCase().includes(buscaItens.toLowerCase()) ||
          item.descricao.toLowerCase().includes(buscaItens.toLowerCase()),
      ),
    [items, buscaItens],
  );

  // ─── Ações ────────────────────────────────────────────────────────────────────

  /**
   * Carrega poder no editor via localStorage (bridge com usePoderPersistence).
   */
  const handleCarregar = (poderResp: PoderResponse) => {
    setCarregandoId(poderResp.id);
    try {
      const poderSalvo = poderResponseToPoderSalvo(poderResp);
      localStorage.setItem('criador-de-poder-carregar', JSON.stringify(poderSalvo));
      localStorage.setItem('criador-aba-ativa', JSON.stringify('poderes'));
      navigate('/criador');
      toast.success(`Poder "${poderResp.nome}" carregado!`);
    } catch {
      toast.error('Erro ao carregar poder no editor.');
    } finally {
      setCarregandoId(null);
    }
  };

  const handleDeletar = async (id: string, nome: string) => {
    setDeletandoId(id);
    try {
      await deletar(id);
      toast.success(`Poder "${nome}" deletado.`);
    } catch {
      toast.error(`Erro ao deletar "${nome}".`);
    } finally {
      setDeletandoId(null);
    }
  };

  const handleDuplicar = async (poder: PoderResponse, nome: string) => {
    setDuplicandoId(poder.id);
    try {
      const payload: CreatePoderPayload = {
        nome: `Cópia de ${poder.nome}`,
        descricao: poder.descricao,
        dominio: {
          name: poder.dominio.name,
          areaConhecimento: poder.dominio.areaConhecimento ?? undefined,
          peculiarId: poder.dominio.peculiarId ?? undefined,
        },
        parametros: { ...poder.parametros },
        effects: poder.effects.map((e) => ({
          effectBaseId: e.effectBaseId,
          grau: e.grau,
          configuracaoId: e.configuracaoId ?? undefined,
          inputValue: e.inputValue ?? undefined,
          modifications: e.modifications.map((m) => ({
            modificationBaseId: m.modificationBaseId,
            scope: m.scope,
            grau: m.grau ?? undefined,
            parametros: m.parametros ?? undefined,
            nota: m.nota ?? undefined,
          })),
          nota: e.nota ?? undefined,
        })),
        globalModifications: poder.globalModifications.map((m) => ({
          modificationBaseId: m.modificationBaseId,
          scope: m.scope,
          grau: m.grau ?? undefined,
          parametros: m.parametros ?? undefined,
          nota: m.nota ?? undefined,
        })),
        isPublic: false,
        notas: poder.notas ?? undefined,
      };
      await criar(payload);
      toast.success(`Cópia de "${nome}" criada.`);
    } catch {
      toast.error(`Erro ao duplicar "${nome}".`);
    } finally {
      setDuplicandoId(null);
    }
  };

  const handleTogglePublic = async (poder: PoderResponse) => {
    setTogglePublicId(poder.id);
    try {
      await atualizar(poder.id, { isPublic: !poder.isPublic });
      toast.success(poder.isPublic ? `"${poder.nome}" agora é privado.` : `"${poder.nome}" publicado!`);
    } catch {
      toast.error('Erro ao alterar visibilidade.');
    } finally {
      setTogglePublicId(null);
    }
  };

  const handleCarregarItem = (item: ItemResponse) => {
    setCarregandoItemId(item.id);
    try {
      localStorage.setItem('criador-de-item-carregar', JSON.stringify(item));
      localStorage.setItem('criador-aba-ativa', JSON.stringify('itens'));
      navigate('/criador');
      toast.success(`Item "${item.nome}" carregado no criador.`);
    } catch {
      toast.error('Erro ao carregar item no criador.');
    } finally {
      setCarregandoItemId(null);
    }
  };

  const handleDeletarItem = async (item: ItemResponse) => {
    setDeletandoItemId(item.id);
    try {
      await deletarItem(item.id);
      toast.success(`Item "${item.nome}" deletado.`);
    } catch {
      toast.error(`Erro ao deletar "${item.nome}".`);
    } finally {
      setDeletandoItemId(null);
    }
  };

  const handleTogglePublicItem = async (item: ItemResponse) => {
    setTogglePublicItemId(item.id);
    try {
      await atualizarItem(item.id, {
        tipo: item.tipo,
        isPublic: !item.isPublic,
      });
      toast.success(item.isPublic ? `"${item.nome}" agora é privado.` : `"${item.nome}" publicado!`);
    } catch {
      toast.error('Erro ao alterar visibilidade do item.');
    } finally {
      setTogglePublicItemId(null);
    }
  };

  const handleExportarTodos = () => {
    if (poderes.length === 0) return;
    setExportandoTodos(true);
    try {
      const blob = new Blob([JSON.stringify(poderes, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `biblioteca-poderes-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`${poderes.length} poderes exportados!`);
    } catch {
      toast.error('Erro ao exportar poderes.');
    } finally {
      setExportandoTodos(false);
    }
  };

  const handleImportar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImportando(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const lista = Array.isArray(parsed) ? parsed : [parsed];
      let ok = 0;
      let falhou = 0;
      for (const item of lista) {
        try {
          const payload = legacyPoderToCreatePayload(item);
          await criar(payload);
          ok++;
        } catch {
          falhou++;
        }
      }
      if (ok > 0) toast.success(`${ok} poder${ok > 1 ? 'es' : ''} importado${ok > 1 ? 's' : ''} com sucesso!`);
      if (falhou > 0) toast.error(`${falhou} poder${falhou > 1 ? 'es' : ''} não pud${falhou > 1 ? 'eram' : 'e'} ser importado${falhou > 1 ? 's' : ''}.`);
    } catch {
      toast.error('Arquivo inválido. Certifique-se de usar um JSON exportado pelo Aetherium.');
    } finally {
      setImportando(false);
    }
  };

  const handleExportar = (poder: PoderResponse, nome: string) => {
    setExportandoId(poder.id);
    try {
      const blob = new Blob([JSON.stringify(poder, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nome.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`"${nome}" exportado!`);
    } catch {
      toast.error('Erro ao exportar poder.');
    } finally {
      setExportandoId(null);
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Abas de navegação */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['poderes', 'itens', 'acervos', 'customizados'] as const).map((aba) => {
          const labels = {
            poderes: 'Poderes Salvos',
            itens: 'Itens Salvos',
            acervos: 'Acervos',
            customizados: 'Itens Customizados',
          };
          const icons = {
            poderes: <Library className="w-4 h-4" />,
            itens: <Package className="w-4 h-4" />,
            acervos: <Package className="w-4 h-4" />,
            customizados: <Sparkles className="w-4 h-4" />,
          };
          return (
            <button
              key={aba}
              onClick={() => setAbaAtiva(aba)}
              className={`px-4 py-2 font-medium transition-colors border-b-2 flex items-center gap-2 ${
                abaAtiva === aba
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {icons[aba]} {labels[aba]}
            </button>
          );
        })}
      </div>

      {/* ── Aba Poderes ── */}
      {abaAtiva === 'poderes' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Library className="w-5 h-5" /> Biblioteca de Poderes
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {loading
                      ? 'Carregando…'
                      : `${poderes.length} ${poderes.length === 1 ? 'poder salvo' : 'poderes salvos'}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => recarregar()}
                    disabled={loading}
                    className="flex items-center gap-2"
                    aria-label="Recarregar poderes"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportarTodos}
                    disabled={loading || exportandoTodos || poderes.length === 0}
                    className="flex items-center gap-2"
                    aria-label="Exportar todos os poderes"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Todos
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => importInputRef.current?.click()}
                    disabled={importando}
                    className="flex items-center gap-2"
                    aria-label="Importar poderes de arquivo JSON"
                  >
                    <Upload className="w-4 h-4" />
                    {importando ? 'Importando…' : 'Importar JSON'}
                  </Button>
                  <input
                    ref={importInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportar}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {poderes.length > 0 && !loading && (
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {/* Estado de erro */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Lista de poderes */}
          {!loading && poderesFiltrados.length === 0 ? (
            <EmptyState
              icon={<Library className="w-12 h-12 text-gray-400" />}
              title={poderes.length === 0 ? 'Nenhum poder salvo ainda' : 'Nenhum poder encontrado'}
              description={
                poderes.length === 0
                  ? 'Crie seu primeiro poder e salve na biblioteca para acessá-lo aqui!'
                  : 'Tente buscar com outros termos'
              }
              action={{
                label: 'Criar Novo Poder',
                onClick: () => navigate('/'),
                icon: <Plus className="w-4 h-4" />,
              }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {poderesFiltrados.map((poderSalvo) => {
                const poderResp = poderes.find((p) => p.id === poderSalvo.id)!;
                return (
                  <SwipeablePoderCard
                    key={poderSalvo.id}
                    poder={poderSalvo}
                    isPublic={poderResp.isPublic}
                    onCarregar={() => handleCarregar(poderResp)}
                    onDuplicar={() => handleDuplicar(poderResp, poderSalvo.nome)}
                    onExportar={() => handleExportar(poderResp, poderSalvo.nome)}
                    onDeletar={() => handleDeletar(poderSalvo.id, poderSalvo.nome)}
                    onTogglePublic={() => handleTogglePublic(poderResp)}
                    onVerResumo={() => setPoderVisualizando(poderResp)}
                    formatarData={formatarData}
                    carregandoId={carregandoId}
                    deletandoId={deletandoId}
                    duplicandoId={duplicandoId}
                    exportandoId={exportandoId}
                    togglePublicId={togglePublicId}
                  />
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── Aba Itens ── */}
      {abaAtiva === 'itens' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" /> Biblioteca de Itens
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {loadingItens
                      ? 'Carregando…'
                      : `${items.length} ${items.length === 1 ? 'item salvo' : 'itens salvos'}`}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => recarregarItens()}
                  disabled={loadingItens}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingItens ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length > 0 && !loadingItens && (
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={buscaItens}
                  onChange={(e) => setBuscaItens(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          {erroItens && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{erroItens}</span>
            </div>
          )}

          {!loadingItens && itensFiltrados.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12 text-gray-400" />}
              title={items.length === 0 ? 'Nenhum item salvo ainda' : 'Nenhum item encontrado'}
              description={
                items.length === 0
                  ? 'Crie seu primeiro item para gerenciar por aqui.'
                  : 'Tente buscar com outros termos.'
              }
              action={{
                label: 'Criar Novo Item',
                onClick: () => {
                  localStorage.setItem('criador-aba-ativa', JSON.stringify('itens'));
                  navigate('/criador');
                },
                icon: <Plus className="w-4 h-4" />,
              }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {itensFiltrados.map((item) => (
                <SwipeableItemCard
                  key={item.id}
                  item={item}
                  onCarregar={() => handleCarregarItem(item)}
                  onDeletar={() => handleDeletarItem(item)}
                  onTogglePublic={() => handleTogglePublicItem(item)}
                  onVerResumo={() => setItemVisualizando(item)}
                  formatarData={formatarData}
                  carregandoId={carregandoItemId}
                  deletandoId={deletandoItemId}
                  togglePublicId={togglePublicItemId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Aba Acervos ── */}
      {abaAtiva === 'acervos' && <ListaAcervos />}

      {/* ── Aba Customizados ── */}
      {abaAtiva === 'customizados' && <GerenciadorCustomizados />}

      {/* Modal Resumo do Poder */}
      {poderVisualizandoConvertido && (
        <ResumoPoder
          isOpen={!!poderVisualizando}
          onClose={() => setPoderVisualizando(null)}
          poder={poderVisualizandoConvertido.poder}
          detalhes={poderVisualizandoConvertido.detalhes}
        />
      )}

      {itemVisualizando && (
        <ResumoItem
          isOpen={!!itemVisualizando}
          onClose={() => setItemVisualizando(null)}
          tipo={itemVisualizando.tipo}
          nome={itemVisualizando.nome}
          icone={itemVisualizando.icone ?? undefined}
          descricao={itemVisualizando.descricao}
          dominio={{
            name: itemVisualizando.dominio.name,
            areaConhecimento: itemVisualizando.dominio.areaConhecimento ?? undefined,
            peculiarId: itemVisualizando.dominio.peculiarId ?? undefined,
          }}
          custoBase={itemVisualizando.custoBase}
          nivelCalculado={itemVisualizando.nivelItem}
          custoRealCalculado={itemVisualizando.valorBase}
          precoVendaCalculado={itemVisualizando.precoVenda}
          selectedPowers={itemPoderesSelecionados}
          selectedPowerArrays={itemAcervosSelecionados}
          onOpenPowerDetails={(powerId) => setItemPoderResumoId(powerId)}
          onOpenPowerArrayDetails={(powerArrayId) => setItemAcervoResumoId(powerArrayId)}
          itemData={itemVisualizando}
        />
      )}

      <ResumoVinculoModal
        isOpen={!!itemPoderResumoSelecionado || !!itemAcervoResumoSelecionado}
        onClose={() => {
          setItemPoderResumoId(null);
          setItemAcervoResumoId(null);
        }}
        poder={itemPoderResumoSelecionado}
        acervo={itemAcervoResumoSelecionado}
      />
    </div>
  );
}
