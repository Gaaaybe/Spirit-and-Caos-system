import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Badge,
  EmptyState,
  toast,
} from '../shared/ui';
import { fetchPublicPowers } from '../services/powers.service';
import { fetchPublicPowerArrays, copyPowerArray } from '../services/powerArrays.service';
import { fetchPublicPeculiarities, copyPeculiarity } from '../services/peculiarities.service';
import { usePoderes } from '../features/criador-de-poder/hooks/usePoderes';
import { ResumoPoder } from '../features/criador-de-poder/components/ResumoPoder';
import { poderResponseToPoder } from '../features/criador-de-poder/utils/poderApiConverter';
import { calcularDetalhesPoder } from '../features/criador-de-poder/regras/calculadoraCusto';
import { useCatalog } from '../context/useCatalog';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import type { PoderResponse, AcervoResponse, PeculiaridadeResponse } from '../services/types';
import {
  Globe,
  Zap,
  Package,
  Search,
  Copy,
  RefreshCw,
  AlertCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function CardPoderPublico({
  poder,
  onCopiar,
  copiandoId,
  onVerResumo,
}: {
  poder: PoderResponse;
  onCopiar: (id: string) => void;
  copiandoId: string | null;
  onVerResumo: () => void;
}) {
  return (
    <Card hover className="flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div
          className="flex items-start justify-between gap-2 cursor-pointer"
          onClick={onVerResumo}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-words hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              {poder.nome}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 capitalize">
              {poder.dominio.name}
            </p>
          </div>
          <Badge variant="secondary" size="sm" className="flex-shrink-0">
            {poder.effects.length} {poder.effects.length === 1 ? 'efeito' : 'efeitos'}
          </Badge>
        </div>

        {poder.descricao && (
          <p
            className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words flex-1 cursor-pointer"
            onClick={onVerResumo}
          >
            {poder.descricao}
          </p>
        )}

        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="text-xs text-gray-400">
            {poder.custoTotal.pda} PdA{poder.custoTotal.pe > 0 ? ` · ${poder.custoTotal.pe} PE` : ''}
          </span>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onCopiar(poder.id)}
            loading={copiandoId === poder.id}
            disabled={copiandoId !== null}
            className="flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CardAcervoPublico({
  acervo,
  onCopiar,
  copiandoId,
}: {
  acervo: AcervoResponse;
  onCopiar: (id: string) => void;
  copiandoId: string | null;
}) {
  const [expandido, setExpandido] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpandido((v) => !v)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-words">
                {acervo.nome}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Descritor:</span> {acervo.descricao}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {acervo.powers.length} {acervo.powers.length === 1 ? 'poder' : 'poderes'} ·{' '}
              {acervo.custoTotal.pda} PdA{acervo.custoTotal.pe > 0 ? ` · ${acervo.custoTotal.pe} PE` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 mt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onCopiar(acervo.id); }}
              loading={copiandoId === acervo.id}
              disabled={copiandoId !== null}
              className="flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" /> Copiar
            </Button>
            <button className="text-gray-400">
              {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {expandido && acervo.powers.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 pt-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">
            Poderes do acervo
          </p>
          <div className="space-y-1.5">
            {acervo.powers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-sm rounded bg-gray-50 dark:bg-gray-800 px-3 py-1.5"
              >
                <span className="text-gray-800 dark:text-gray-200">{p.nome}</span>
                <span className="text-xs text-gray-500">{p.custoTotal.pda} PdA</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

function CardPeculiaridadePublica({
  peculiaridade,
  onCopiar,
  copiandoId,
}: {
  peculiaridade: PeculiaridadeResponse;
  onCopiar: (id: string) => void;
  copiandoId: string | null;
}) {
  return (
    <Card hover className="flex flex-col">
      <CardContent className="p-4 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 break-words">
              {peculiaridade.nome}
            </h3>
            <span className={`text-xs mt-0.5 font-medium ${
              peculiaridade.espiritual
                ? 'text-espirito-600 dark:text-espirito-400'
                : 'text-gray-500 dark:text-gray-500'
            }`}>
              {peculiaridade.espiritual ? 'Espiritual' : 'Não espiritual'}
            </span>
          </div>
          <Badge variant="secondary" size="sm" className="flex-shrink-0">
            <Sparkles className="w-3 h-3 mr-1" /> Peculiaridade
          </Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 break-words flex-1">
          {peculiaridade.descricao}
        </p>

        <div className="flex justify-end pt-1 mt-auto">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onCopiar(peculiaridade.id)}
            loading={copiandoId === peculiaridade.id}
            disabled={copiandoId !== null}
            className="flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" /> Copiar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComunidadePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { copiar } = usePoderes();
  const { efeitos, modificacoes } = useCatalog();

  const [aba, setAba] = useState<'poderes' | 'acervos' | 'peculiaridades'>('poderes');
  const [buscaPoderes, setBuscaPoderes] = useState('');
  const [buscaAcervos, setBuscaAcervos] = useState('');
  const [buscaPeculiaridades, setBuscaPeculiaridades] = useState('');
  const [poderVisualizando, setPoderVisualizando] = useState<PoderResponse | null>(null);

  const [poderes, setPoderes] = useState<PoderResponse[]>([]);
  const [acervos, setAcervos] = useState<AcervoResponse[]>([]);
  const [peculiaridades, setPeculiaridades] = useState<PeculiaridadeResponse[]>([]);
  const [loadingPoderes, setLoadingPoderes] = useState(true);
  const [loadingAcervos, setLoadingAcervos] = useState(true);
  const [loadingPeculiaridades, setLoadingPeculiaridades] = useState(true);
  const [erroPoderes, setErroPoderes] = useState<string | null>(null);
  const [erroAcervos, setErroAcervos] = useState<string | null>(null);
  const [erroPeculiaridades, setErroPeculiaridades] = useState<string | null>(null);
  const [copiandoId, setCopiandoId] = useState<string | null>(null);
  const [copiandoAcervoId, setCopiandoAcervoId] = useState<string | null>(null);
  const [copiandoPeculiaridadeId, setCopiandoPeculiaridadeId] = useState<string | null>(null);

  const poderVisualizandoConvertido = useMemo(() => {
    if (!poderVisualizando) return null;
    const poder = poderResponseToPoder(poderVisualizando);
    const detalhes = calcularDetalhesPoder(poder, efeitos, modificacoes);
    return { poder, detalhes };
  }, [poderVisualizando, efeitos, modificacoes]);

  const carregarPoderes = useCallback(async () => {
    setLoadingPoderes(true);
    setErroPoderes(null);
    try {
      const data = await fetchPublicPowers();
      setPoderes(data);
    } catch {
      setErroPoderes('Não foi possível carregar os poderes públicos.');
    } finally {
      setLoadingPoderes(false);
    }
  }, []);

  const carregarAcervos = useCallback(async () => {
    setLoadingAcervos(true);
    setErroAcervos(null);
    try {
      const data = await fetchPublicPowerArrays();
      setAcervos(data);
    } catch {
      setErroAcervos('Não foi possível carregar os acervos públicos.');
    } finally {
      setLoadingAcervos(false);
    }
  }, []);

  const carregarPeculiaridades = useCallback(async () => {
    setLoadingPeculiaridades(true);
    setErroPeculiaridades(null);
    try {
      const data = await fetchPublicPeculiarities();
      setPeculiaridades(data);
    } catch {
      setErroPeculiaridades('Não foi possível carregar as peculiaridades públicas.');
    } finally {
      setLoadingPeculiaridades(false);
    }
  }, []);

  useEffect(() => {
    carregarPoderes();
    carregarAcervos();
    carregarPeculiaridades();
  }, [carregarPoderes, carregarAcervos, carregarPeculiaridades]);

  const handleCopiar = async (powerId: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para copiar poderes.');
      navigate('/entrar');
      return;
    }
    setCopiandoId(powerId);
    try {
      const novo = await copiar(powerId);
      toast.success(`"${novo.nome}" copiado para sua biblioteca!`);
    } catch {
      toast.error('Erro ao copiar poder. Tente novamente.');
    } finally {
      setCopiandoId(null);
    }
  };

  const handleCopiarAcervo = async (acervoId: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para copiar acervos.');
      navigate('/entrar');
      return;
    }
    setCopiandoAcervoId(acervoId);
    try {
      const novo = await copyPowerArray(acervoId);
      toast.success(`"${novo.nome}" e seus poderes copiados para sua biblioteca!`);
    } catch {
      toast.error('Erro ao copiar acervo. Tente novamente.');
    } finally {
      setCopiandoAcervoId(null);
    }
  };

  const handleCopiarPeculiaridade = async (peculiarityId: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para copiar peculiaridades.');
      navigate('/entrar');
      return;
    }
    setCopiandoPeculiaridadeId(peculiarityId);
    try {
      const nova = await copyPeculiarity(peculiarityId);
      toast.success(`"${nova.nome}" copiada para seus itens customizados!`);
    } catch {
      toast.error('Erro ao copiar peculiaridade. Tente novamente.');
    } finally {
      setCopiandoPeculiaridadeId(null);
    }
  };

  const poderesFiltrados = poderes
    .filter((p) => p.userId !== user?.id)
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(buscaPoderes.toLowerCase()) ||
        (p.descricao && p.descricao.toLowerCase().includes(buscaPoderes.toLowerCase())),
    );

  const acervosFiltrados = acervos
    .filter((a) => a.userId !== user?.id)
    .filter(
      (a) =>
        a.nome.toLowerCase().includes(buscaAcervos.toLowerCase()) ||
        a.descricao.toLowerCase().includes(buscaAcervos.toLowerCase()),
    );

  const peculiaridadesFiltradas = peculiaridades
    .filter((p) => p.userId !== user?.id)
    .filter(
      (p) =>
        p.nome.toLowerCase().includes(buscaPeculiaridades.toLowerCase()) ||
        p.descricao.toLowerCase().includes(buscaPeculiaridades.toLowerCase()),
    );

  const isLoading = aba === 'poderes' ? loadingPoderes : aba === 'acervos' ? loadingAcervos : loadingPeculiaridades;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-espirito-600 to-purple-700 dark:from-espirito-800 dark:to-purple-900 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-7 h-7 opacity-90" />
          <h1 className="text-2xl font-bold">Comunidade</h1>
        </div>
        <p className="text-espirito-100 dark:text-espirito-200 text-sm max-w-xl">
          Explore poderes e acervos compartilhados pela comunidade. Copie o que gostar para a sua
          biblioteca e adapte como quiser.
        </p>
        {!isAuthenticated && (
          <div className="mt-4 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 text-sm w-fit">
            <Lock className="w-4 h-4" />
            <span>
              <button className="underline font-medium" onClick={() => navigate('/entrar')}>
                Entre
              </button>{' '}
              para copiar conteúdo para sua biblioteca
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(['poderes', 'acervos', 'peculiaridades'] as const).map((tab) => {
          const labels = { poderes: 'Poderes', acervos: 'Acervos', peculiaridades: 'Peculiaridades' };
          const icons = {
            poderes: <Zap className="w-4 h-4" />,
            acervos: <Package className="w-4 h-4" />,
            peculiaridades: <Sparkles className="w-4 h-4" />,
          };
          const counts = {
            poderes: poderesFiltrados.length,
            acervos: acervosFiltrados.length,
            peculiaridades: peculiaridadesFiltradas.length,
          };
          return (
            <button
              key={tab}
              onClick={() => setAba(tab)}
              className={`px-4 py-2.5 font-medium transition-colors border-b-2 flex items-center gap-2 text-sm ${
                aba === tab
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {icons[tab]} {labels[tab]}
              {!isLoading && counts[tab] > 0 && (
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full px-1.5 py-0.5">
                  {counts[tab]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Aba Poderes ── */}
      {aba === 'poderes' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  {loadingPoderes ? 'Carregando…' : `${poderesFiltrados.length} ${poderesFiltrados.length === 1 ? 'poder público' : 'poderes públicos'}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {poderes.length > 0 && (
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={buscaPoderes}
                        onChange={(e) => setBuscaPoderes(e.target.value)}
                        placeholder="Buscar poderes..."
                        className="pl-9"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={carregarPoderes}
                    disabled={loadingPoderes}
                    className="flex items-center gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPoderes ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {erroPoderes && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{erroPoderes}</span>
            </div>
          )}

          {!loadingPoderes && poderesFiltrados.length === 0 ? (
            <EmptyState
              icon={<Zap className="w-12 h-12 text-gray-400" />}
              title={buscaPoderes ? 'Nenhum resultado' : 'Nenhum poder público ainda'}
              description={
                buscaPoderes
                  ? `Nenhum poder corresponde a "${buscaPoderes}"`
                  : 'Seja o primeiro a publicar um poder na comunidade!'
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {poderesFiltrados.map((poder) => (
                <CardPoderPublico
                  key={poder.id}
                  poder={poder}
                  onCopiar={handleCopiar}
                  copiandoId={copiandoId}
                  onVerResumo={() => setPoderVisualizando(poder)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Aba Acervos ── */}
      {aba === 'acervos' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {loadingAcervos ? 'Carregando…' : `${acervosFiltrados.length} ${acervosFiltrados.length === 1 ? 'acervo público' : 'acervos públicos'}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {acervos.length > 0 && (
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={buscaAcervos}
                        onChange={(e) => setBuscaAcervos(e.target.value)}
                        placeholder="Buscar acervos..."
                        className="pl-9"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={carregarAcervos}
                    disabled={loadingAcervos}
                    className="flex items-center gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingAcervos ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {erroAcervos && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{erroAcervos}</span>
            </div>
          )}

          {!loadingAcervos && acervosFiltrados.length === 0 ? (
            <EmptyState
              icon={<Package className="w-12 h-12 text-gray-400" />}
              title={buscaAcervos ? 'Nenhum resultado' : 'Nenhum acervo público ainda'}
              description={
                buscaAcervos
                  ? `Nenhum acervo corresponde a "${buscaAcervos}"`
                  : 'Seja o primeiro a publicar um acervo na comunidade!'
              }
            />
          ) : (
            <div className="space-y-3">
              {acervosFiltrados.map((acervo) => (
                <CardAcervoPublico
                  key={acervo.id}
                  acervo={acervo}
                  onCopiar={handleCopiarAcervo}
                  copiandoId={copiandoAcervoId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Aba Peculiaridades ── */}
      {aba === 'peculiaridades' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {loadingPeculiaridades ? 'Carregando…' : `${peculiaridadesFiltradas.length} ${peculiaridadesFiltradas.length === 1 ? 'peculiaridade pública' : 'peculiaridades públicas'}`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {peculiaridades.length > 0 && (
                    <div className="relative flex-1 min-w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        value={buscaPeculiaridades}
                        onChange={(e) => setBuscaPeculiaridades(e.target.value)}
                        placeholder="Buscar peculiaridades..."
                        className="pl-9"
                      />
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={carregarPeculiaridades}
                    disabled={loadingPeculiaridades}
                    className="flex items-center gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPeculiaridades ? 'animate-spin' : ''}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {erroPeculiaridades && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm">{erroPeculiaridades}</span>
            </div>
          )}

          {!loadingPeculiaridades && peculiaridadesFiltradas.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="w-12 h-12 text-gray-400" />}
              title={buscaPeculiaridades ? 'Nenhum resultado' : 'Nenhuma peculiaridade pública ainda'}
              description={
                buscaPeculiaridades
                  ? `Nenhuma peculiaridade corresponde a "${buscaPeculiaridades}"`
                  : 'Seja o primeiro a publicar uma peculiaridade na comunidade!'
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {peculiaridadesFiltradas.map((p) => (
                <CardPeculiaridadePublica
                  key={p.id}
                  peculiaridade={p}
                  onCopiar={handleCopiarPeculiaridade}
                  copiandoId={copiandoPeculiaridadeId}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Resumo do Poder */}
      {poderVisualizandoConvertido && (
        <ResumoPoder
          isOpen={!!poderVisualizando}
          onClose={() => setPoderVisualizando(null)}
          poder={poderVisualizandoConvertido.poder}
          detalhes={poderVisualizandoConvertido.detalhes}
        />
      )}
    </div>
  );
}
