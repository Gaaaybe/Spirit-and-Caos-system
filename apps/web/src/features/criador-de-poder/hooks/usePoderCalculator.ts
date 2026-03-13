import { useState, useMemo, useEffect } from 'react';
import { useCatalog } from '@/context/useCatalog';
import { 
  Poder, 
  EfeitoAplicado, 
  ModificacaoAplicada,
  calcularDetalhesPoder,
  calcularParametrosPadrao
} from '../regras/calculadoraCusto';
import { usePoderPersistence, PODER_PADRAO } from './usePoderPersistence';

export function usePoderCalculator() {
  const { efeitos: efeitosBase, modificacoes: modificacoesBase } = useCatalog();
  const { 
    carregarEstadoInicial, 
    salvarAutomaticamente, 
    limparPersistencia, 
    habilitarAutoAtualizacaoParametros,
  } = usePoderPersistence();

  const todosEfeitos = efeitosBase;
  const todasModificacoes = modificacoesBase;

  const [poder, setPoder] = useState<Poder>(carregarEstadoInicial);

  // Auto-save: Salva o poder no localStorage sempre que ele mudar
  useEffect(() => {
    salvarAutomaticamente(poder);
  }, [poder, salvarAutomaticamente]);

  // Calcula detalhes do poder (memoizado para performance)
  const detalhes = useMemo(() => {
    return calcularDetalhesPoder(poder, todosEfeitos, todasModificacoes);
  }, [poder, todosEfeitos, todasModificacoes]);

  // Adiciona um novo efeito ao poder
  const adicionarEfeito = (efeitoBaseId: string, grau: number = 1) => {
    const efeitoBase = todosEfeitos.find(e => e.id === efeitoBaseId);
    if (!efeitoBase) return;

    const novoEfeito: EfeitoAplicado = {
      id: `efeito-${Date.now()}`,
      efeitoBaseId,
      grau,
      modificacoesLocais: [],
    };

    // Ao adicionar efeito manualmente, permite auto-atualização de parâmetros
    habilitarAutoAtualizacaoParametros();

    setPoder(prev => {
      const efeitos = [...prev.efeitos, novoEfeito];
      const parametros = calcularParametrosPadrao(efeitos, todosEfeitos);

      return {
        ...prev,
        efeitos,
        acao: parametros.acao,
        alcance: parametros.alcance,
        duracao: parametros.duracao,
      };
    });
  };

  // Remove um efeito
  const removerEfeito = (efeitoId: string) => {
    // Ao remover efeito manualmente, permite auto-atualização de parâmetros
    habilitarAutoAtualizacaoParametros();
    
    setPoder(prev => {
      const efeitos = prev.efeitos.filter(e => e.id !== efeitoId);

      if (efeitos.length === 0) {
        return {
          ...prev,
          efeitos,
          acao: 0,
          alcance: 0,
          duracao: 0,
        };
      }

      const parametros = calcularParametrosPadrao(efeitos, todosEfeitos);

      return {
        ...prev,
        efeitos,
        acao: parametros.acao,
        alcance: parametros.alcance,
        duracao: parametros.duracao,
      };
    });
  };

  // Atualiza o grau de um efeito
  const atualizarGrauEfeito = (efeitoId: string, novoGrau: number) => {
    setPoder(prev => ({
      ...prev,
      efeitos: prev.efeitos.map(e =>
        e.id === efeitoId ? { ...e, grau: Math.max(-5, Math.min(20, novoGrau)) } : e
      ),
    }));
  };

  // Atualiza um parâmetro do poder (aplicado a todos os efeitos)
  const atualizarParametroPoder = (
    parametro: 'acao' | 'alcance' | 'duracao',
    valor: number | undefined
  ) => {
    setPoder(prev => ({
      ...prev,
      [parametro]: valor,
    }));
  };

  // Atualiza o input customizado de um efeito
  const atualizarInputCustomizado = (efeitoId: string, valor: string) => {
    setPoder(prev => ({
      ...prev,
      efeitos: prev.efeitos.map(e =>
        e.id === efeitoId ? { ...e, inputCustomizado: valor } : e
      ),
    }));
  };

  // Atualiza a configuração selecionada de um efeito (ex: Imunidade Patamar 2)
  const atualizarConfiguracaoEfeito = (efeitoId: string, configuracaoId: string) => {
    setPoder(prev => ({
      ...prev,
      efeitos: prev.efeitos.map(e =>
        e.id === efeitoId ? { ...e, configuracaoSelecionada: configuracaoId } : e
      ),
    }));
  };

  // Adiciona modificação local a um efeito
  const adicionarModificacaoLocal = (
    efeitoId: string,
    modificacaoBaseId: string,
    parametros?: Record<string, unknown>
  ) => {
    const novaModificacao: ModificacaoAplicada = {
      id: `mod-${Date.now()}`,
      modificacaoBaseId,
      escopo: 'local',
      parametros,
      grauModificacao: parametros?.grau ? Number(parametros.grau) : undefined,
    };

    setPoder(prev => ({
      ...prev,
      efeitos: prev.efeitos.map(e =>
        e.id === efeitoId
          ? { ...e, modificacoesLocais: [...e.modificacoesLocais, novaModificacao] }
          : e
      ),
    }));
  };

  // Remove modificação local de um efeito
  const removerModificacaoLocal = (efeitoId: string, modificacaoId: string) => {
    setPoder(prev => ({
      ...prev,
      efeitos: prev.efeitos.map(e =>
        e.id === efeitoId
          ? { ...e, modificacoesLocais: e.modificacoesLocais.filter(m => m.id !== modificacaoId) }
          : e
      ),
    }));
  };

  // Adiciona modificação global ao poder
  const adicionarModificacaoGlobal = (
    modificacaoBaseId: string,
    parametros?: Record<string, unknown>
  ) => {
    const novaModificacao: ModificacaoAplicada = {
      id: `mod-${Date.now()}`,
      modificacaoBaseId,
      escopo: 'global',
      parametros,
      grauModificacao: parametros?.grau ? Number(parametros.grau) : undefined,
    };

    setPoder(prev => ({
      ...prev,
      modificacoesGlobais: [...prev.modificacoesGlobais, novaModificacao],
    }));
  };

  // Remove modificação global
  const removerModificacaoGlobal = (modificacaoId: string) => {
    setPoder(prev => ({
      ...prev,
      modificacoesGlobais: prev.modificacoesGlobais.filter(m => m.id !== modificacaoId),
    }));
  };

  // Atualiza nome e descrição do poder
  const atualizarInfoPoder = (
    nome?: string, 
    descricao?: string, 
    dominioId?: string, 
    dominioAreaConhecimento?: string,
    dominioIdPeculiar?: string,
    icone?: string
  ) => {
    setPoder(prev => ({
      ...prev,
      ...(nome !== undefined && { nome }),
      ...(descricao !== undefined && { descricao }),
      ...(dominioId !== undefined && { dominioId }),
      ...(dominioAreaConhecimento !== undefined && { dominioAreaConhecimento }),
      ...(dominioIdPeculiar !== undefined && { dominioIdPeculiar }),
      ...(icone !== undefined && { icone: icone || undefined }),
    }));
  };

  // Reseta o poder
  const resetarPoder = () => {
    const novoPoder: Poder = {
      ...PODER_PADRAO,
      id: Date.now().toString(),
    };
    setPoder(novoPoder);
    limparPersistencia();
  };

  // Atualiza o custo alternativo do poder
  const atualizarCustoAlternativo = (custoAlternativo: Poder['custoAlternativo']) => {
    setPoder(prev => ({
      ...prev,
      custoAlternativo,
    }));
  };

  // Carrega um poder existente
  const carregarPoder = (poderParaCarregar: Poder) => {
    setPoder(poderParaCarregar);
  };

  // Atualiza o ID do poder (usado após criação na API para persistir o UUID)
  const atualizarIdPoder = (newId: string) => {
    setPoder((prev) => ({ ...prev, id: newId }));
  };

  return {
    poder,
    detalhes,
    // Ações
    adicionarEfeito,
    removerEfeito,
    atualizarGrauEfeito,
    atualizarParametroPoder,
    atualizarInputCustomizado,
    atualizarConfiguracaoEfeito,
    adicionarModificacaoLocal,
    removerModificacaoLocal,
    adicionarModificacaoGlobal,
    removerModificacaoGlobal,
    atualizarInfoPoder,
    atualizarCustoAlternativo,
    resetarPoder,
    carregarPoder,
    atualizarIdPoder,
  };
}
