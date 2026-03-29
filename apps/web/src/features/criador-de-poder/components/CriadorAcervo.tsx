import { useState, useMemo, useEffect, useRef } from 'react';
import { Modal, ModalFooter, Button, Input, Badge, Card, toast, InlineHelp, EmptyState } from '../../../shared/ui';
import { usePowerArrays } from '../hooks/usePowerArrays';
import { useBibliotecaPoderes } from '../hooks/useBibliotecaPoderes';
import { useAcervoCalculator } from '../hooks/useAcervoCalculator';
import { useCatalog } from '@/context/useCatalog';
import { calcularDetalhesPoder } from '../regras/calculadoraCusto';
import type { Acervo } from '../types/acervo.types';
import type { Poder } from '../regras/calculadoraCusto';
import type { DomainName } from '@/services/types';
import { Package, X, Zap, AlertCircle, CheckCircle } from 'lucide-react';

interface CriadorAcervoProps {
  isOpen: boolean;
  onClose: () => void;
  acervoInicial?: Acervo;
  onSalvo?: () => void;
}

export function CriadorAcervo({ isOpen, onClose, acervoInicial, onSalvo }: CriadorAcervoProps) {
  const { criar: criarAcervo, atualizar: atualizarAcervo } = usePowerArrays();
  const { poderes: bibliotecaPoderes } = useBibliotecaPoderes();
  const { efeitos: efeitosBase, modificacoes: modificacoesBase } = useCatalog();
  
  const [nome, setNome] = useState(acervoInicial?.nome || '');
  const [descritor, setDescritor] = useState(acervoInicial?.descritor || '');
  const [icone, setIcone] = useState(acervoInicial?.icone || '');
  const [poderesSelecionados, setPoderesSelecionados] = useState<Poder[]>(acervoInicial?.poderes || []);
  const [buscaPoder, setBuscaPoder] = useState('');
  const [salvando, setSalvando] = useState(false);
  const loadedAcervoId = useRef<string | null>(null);

  // Sincronizar estado quando acervoInicial mudar ou modal abrir
  useEffect(() => {
    if (isOpen) {
      const currentId = acervoInicial?.id || 'new';
      if (currentId !== loadedAcervoId.current) {
        if (acervoInicial) {
          // Modo edição: carregar dados
          setNome(acervoInicial.nome);
          setDescritor(acervoInicial.descritor);
          setIcone(acervoInicial.icone || '');
          setPoderesSelecionados(acervoInicial.poderes);
        } else {
          // Modo criar: limpar campos
          setNome('');
          setDescritor('');
          setIcone('');
          setPoderesSelecionados([]);
        }
        setBuscaPoder('');
        loadedAcervoId.current = currentId;
      }
    } else {
      loadedAcervoId.current = null;
    }
  }, [acervoInicial, isOpen]);

  const todosEfeitos = efeitosBase;
  const todasModificacoes = modificacoesBase;

  // Calcular detalhes de cada poder selecionado CORRETAMENTE
  const poderesComDetalhes = useMemo(() => {
    return poderesSelecionados.map(poder => {
      const detalhes = calcularDetalhesPoder(poder, todosEfeitos, todasModificacoes);
      return { poder, detalhes };
    });
  }, [poderesSelecionados, efeitosBase, modificacoesBase]);

  // Criar acervo temporário para cálculos
  const acervoTemp: Acervo = {
    id: acervoInicial?.id || `acervo-${Date.now()}`,
    nome: nome || 'Acervo sem nome',
    descritor: descritor || '',
    poderes: poderesSelecionados,
    dataCriacao: acervoInicial?.dataCriacao || new Date().toISOString(),
    dataModificacao: new Date().toISOString(),
  };

  // Calcular detalhes do acervo
  const detalhesAcervo = useAcervoCalculator(acervoTemp, poderesComDetalhes);

  // Filtrar poderes da biblioteca
  const poderesFiltrados = useMemo(() => {
    if (!buscaPoder) return bibliotecaPoderes;
    return bibliotecaPoderes.filter(p => 
      p.nome.toLowerCase().includes(buscaPoder.toLowerCase())
    );
  }, [bibliotecaPoderes, buscaPoder]);

  // Poderes disponíveis (não adicionados ainda)
  const poderesDisponiveis = useMemo(() => {
    const idsAdicionados = new Set(poderesSelecionados.map(p => p.id));
    return poderesFiltrados.filter(p => !idsAdicionados.has(p.id));
  }, [poderesFiltrados, poderesSelecionados]);

  const handleAdicionarPoder = (poder: Poder) => {
    setPoderesSelecionados(prev => [...prev, poder]);
    setBuscaPoder('');
  };

  const handleRemoverPoder = (powerId: string) => {
    setPoderesSelecionados(prev => prev.filter(p => p.id !== powerId));
  };

  const handleSalvar = async () => {
    if (!nome.trim()) {
      toast.error('Digite um nome para o acervo');
      return;
    }
    if (!descritor.trim()) {
      toast.error('Digite um descritor para o acervo');
      return;
    }
    if (poderesSelecionados.length === 0) {
      toast.error('Adicione ao menos um poder ao acervo');
      return;
    }
    if (!detalhesAcervo.valido) {
      toast.error('Corrija os erros antes de salvar');
      return;
    }

    // Deriva domínio: usa o preservado do acervo existente ou o do primeiro poder
    const dominioId = (acervoInicial?.dominioId ||
      poderesSelecionados[0]?.dominioId ||
      'natural') as DomainName;

    const isApiId = acervoInicial?.id && /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(acervoInicial.id);
    const iconeTrimmed = icone.trim();

    const payload: any = {
      nome: nome.trim(),
      descricao: descritor.trim(),
      dominio: {
        name: dominioId,
        areaConhecimento: acervoInicial?.dominioAreaConhecimento,
        peculiarId: acervoInicial?.dominioIdPeculiar,
      },
      powerIds: poderesSelecionados.map((p) => p.id),
    };

    if (isApiId) {
      payload.icone = iconeTrimmed ? iconeTrimmed : null;
    } else if (iconeTrimmed) {
      payload.icone = iconeTrimmed;
    }

    setSalvando(true);
    try {
      if (acervoInicial?.id && isApiId) {
        await atualizarAcervo(acervoInicial.id, payload);
        toast.success(`Acervo "${nome}" atualizado!`);
      } else {
        await criarAcervo(payload);
        toast.success(`Acervo "${nome}" criado!`);
      }
      handleClose();
      onSalvo?.();
    } catch {
      toast.error('Erro ao salvar acervo. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={acervoInicial ? 'Editar Acervo' : 'Novo Acervo'}
      size="xl"
    >
      <div className="space-y-4">
        {/* Info sobre Acervos */}
        <InlineHelp
          type="info"
          text="Acervo: conjunto de poderes com descritor comum. Custo = poder mais caro + 1 PdA por cada adicional. Apenas 1 ativo por vez."
          dismissible={true}
          storageKey="acervo-info"
        />

        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nome do Acervo *
          </label>
          <Input
            value={nome}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
            placeholder="Ex: Arsenal de Fogo, Poderes Elementais..."
          />
        </div>

        {/* Descritor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descritor *
          </label>
          <Input
            value={descritor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescritor(e.target.value)}
            placeholder="Ex: Fogo, Elementais, Lunares, Peculiaridade: Magia Ancestral..."
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            O tema/conceito comum que une todos os poderes deste acervo
          </p>
        </div>

        {/* Ícone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ícone (opcional)
          </label>
          <Input
            value={icone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIcone(e.target.value)}
            placeholder="Cole o link da imagem..."
          />
        </div>

        {/* Poderes Selecionados */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Poderes no Acervo ({poderesSelecionados.length})
            </label>
            {detalhesAcervo.quantidadePoderes >= 2 && (
              <Badge variant={detalhesAcervo.valido ? 'success' : 'warning'}>
                {detalhesAcervo.custoPdATotal} PdA
              </Badge>
            )}
          </div>

          {poderesSelecionados.length === 0 ? (
            <EmptyState
              icon={<Package className="w-8 h-8 text-gray-400" />}
              title="Nenhum poder adicionado"
              description="Adicione pelo menos 2 poderes da biblioteca"
            />
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {poderesSelecionados.map((poder, index) => {
                const isPrincipal = index === detalhesAcervo.poderPrincipalIndex;
                const detalhesPoder = poderesComDetalhes[index]?.detalhes;
                
                return (
                  <Card key={poder.id} className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {poder.nome}
                          </span>
                          {isPrincipal && (
                            <Badge variant="warning">Principal</Badge>
                          )}
                        </div>
                        {poder.duracao === 5 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            ⚠️ Duração Permanente (não permitido)
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge>{detalhesPoder?.custoPdATotal || 0} PdA</Badge>
                        <Badge variant="secondary">{detalhesPoder?.espacosTotal || 0} esp.</Badge>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRemoverPoder(poder.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Validações e Resumo */}
        {poderesSelecionados.length > 0 && (
          <Card className={`p-3 ${detalhesAcervo.valido ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-start gap-2">
              {detalhesAcervo.valido ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                {detalhesAcervo.valido ? (
                  <div>
                    <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">
                      Acervo válido!
                    </p>
                    <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      <p>• Principal: {detalhesAcervo.custoPdAPrincipal} PdA</p>
                      <p>• Adicionais: {detalhesAcervo.custoPdAOutros} PdA ({detalhesAcervo.quantidadePoderes - 1} × 1)</p>
                      <p>• Total: <strong>{detalhesAcervo.custoPdATotal} PdA</strong></p>
                      <p>• Espaços: {detalhesAcervo.espacosTotal}</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">
                      Erros encontrados:
                    </p>
                    <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                      {detalhesAcervo.erros.map((erro, i) => (
                        <li key={i}>• {erro}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Adicionar Poder da Biblioteca */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Adicionar Poder da Biblioteca
            </label>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {poderesDisponiveis.length} disponíveis
            </span>
          </div>
          <Input
            value={buscaPoder}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuscaPoder(e.target.value)}
            placeholder="Buscar poderes..."
          />
          {poderesDisponiveis.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 p-3 text-center">
              {bibliotecaPoderes.length === 0 
                ? 'Nenhum poder na biblioteca. Crie poderes primeiro!'
                : 'Todos os poderes já foram adicionados'}
            </p>
          ) : (
            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {poderesDisponiveis.map(poder => (
                  <button
                    key={poder.id}
                    onClick={() => handleAdicionarPoder(poder)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {poder.nome}
                    </p>
                    {poder.descricao && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {poder.descricao}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSalvar}
          disabled={salvando || !nome.trim() || !descritor.trim() || !detalhesAcervo.valido}
        >
          {salvando ? 'Salvando...' : (acervoInicial ? 'Atualizar' : 'Criar')} Acervo
        </Button>
      </ModalFooter>
    </Modal>
  );
}
