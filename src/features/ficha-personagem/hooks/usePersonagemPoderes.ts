/**
 * Hook para gerenciar Poderes do Personagem
 * Integração entre Ficha de Personagem e Sistema de Poderes
 * 
 * Aplica automaticamente maestria de domínio aos custos dos poderes
 */

import { useCallback } from 'react';
import type { Poder } from '../../criador-de-poder/types';
import type { PersonagemPoder, Domain } from '../types';
import { calcularDetalhesPoder } from '../../criador-de-poder/regras/calculadoraCusto';
import { EFEITOS, MODIFICACOES } from '../../../data';

// ========================================
// TIPOS
// ========================================

interface UsePersonagemPoderesProps {
  poderes: PersonagemPoder[];
  dominios: Domain[];
  onPoderChange: (poderes: PersonagemPoder[]) => void;
}

interface UsePersonagemPoderesReturn {
  // Adicionar poder ao personagem
  vincularPoder: (poder: Poder, dominioId: string) => PersonagemPoder | null;
  
  // Remover poder
  desvincularPoder: (poderId: string) => void;
  
  // Ativar/Desativar poder
  togglePoderAtivo: (poderId: string) => void;
  
  // Atualizar poder (recalcula com nova maestria)
  atualizarPoder: (poderId: string, novosPoder: Poder) => void;
  
  // Calcular custos totais
  calcularCustosTotal: () => { pdaTotal: number; espacosTotal: number };
  
  // Obter modificações de maestria aplicáveis
  getModificacoesMaestria: (mastery: Domain['mastery']) => string[];
}

// ========================================
// MODIFICAÇÕES DE MAESTRIA
// ========================================

/**
 * IDs das modificações de maestria em modificacoes.json
 * Categoria "Dominio"
 */
const MODIFICACOES_MAESTRIA = {
  Iniciante: 'dominio-iniciante',  // +1 PdA/grau
  Mestre: 'dominio-mestre',        // -1 PdA/grau
  // Praticante não tem modificação (custo normal)
};

/**
 * Obtém as modificações de maestria aplicáveis baseado no nível
 */
function getModificacoesMaestriaPorNivel(mastery: Domain['mastery']): string[] {
  if (mastery === 'Iniciante') {
    return [MODIFICACOES_MAESTRIA.Iniciante];
  } else if (mastery === 'Mestre') {
    return [MODIFICACOES_MAESTRIA.Mestre];
  }
  return []; // Praticante = sem modificação
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export function usePersonagemPoderes({
  poderes,
  dominios,
  onPoderChange,
}: UsePersonagemPoderesProps): UsePersonagemPoderesReturn {
  
  /**
   * Aplica maestria do domínio ao poder
   * Adiciona modificação global de maestria se aplicável
   */
  const aplicarMaestria = useCallback((poder: Poder, dominioId: string): Poder => {
    const dominio = dominios.find(d => d.id === dominioId);
    
    if (!dominio || dominio.mastery === 'Praticante') {
      // Sem modificação para Praticante
      return poder;
    }
    
    // Clonar poder para não mutar o original
    const poderComMaestria = JSON.parse(JSON.stringify(poder)) as Poder;
    
    // Obter modificação de maestria
    const modId = MODIFICACOES_MAESTRIA[dominio.mastery];
    
    if (!modId) return poder;
    
    // Verificar se a modificação já existe no poder
    const jaTemMaestria = poderComMaestria.modificacoesGlobais?.some(
      m => m.modificacaoBaseId === modId
    );
    
    if (jaTemMaestria) {
      return poderComMaestria;
    }
    
    // Adicionar modificação global de maestria
    if (!poderComMaestria.modificacoesGlobais) {
      poderComMaestria.modificacoesGlobais = [];
    }
    
    poderComMaestria.modificacoesGlobais.push({
      id: `maestria-${Date.now()}`,
      modificacaoBaseId: modId,
      escopo: 'global',
    });
    
    return poderComMaestria;
  }, [dominios]);
  
  /**
   * Calcula custos do poder com maestria aplicada
   */
  const calcularCustosComMaestria = useCallback((poder: Poder, dominioId: string) => {
    const poderComMaestria = aplicarMaestria(poder, dominioId);
    const detalhes = calcularDetalhesPoder(poderComMaestria, EFEITOS, MODIFICACOES);
    
    return {
      pdaCost: detalhes.custoPdATotal,
      espacosOccupied: detalhes.espacosTotal,
      poderFinal: poderComMaestria,
    };
  }, [aplicarMaestria]);
  
  /**
   * Vincula um poder ao personagem
   */
  const vincularPoder = useCallback((poder: Poder, dominioId: string): PersonagemPoder | null => {
    // Validar domínio
    const dominio = dominios.find(d => d.id === dominioId);
    if (!dominio) {
      console.error('Domínio não encontrado:', dominioId);
      return null;
    }
    
    // Calcular custos com maestria
    const { pdaCost, espacosOccupied, poderFinal } = calcularCustosComMaestria(poder, dominioId);
    
    const agora = new Date().toISOString();
    
    const personagemPoder: PersonagemPoder = {
      id: `pp-${Date.now()}`,
      poderId: poder.id,
      poder: poderFinal,
      dominioId,
      ativo: true,
      pdaCost,
      espacosOccupied,
      dataCriacao: agora,
      dataModificacao: agora,
    };
    
    onPoderChange([...poderes, personagemPoder]);
    return personagemPoder;
  }, [poderes, dominios, calcularCustosComMaestria, onPoderChange]);
  
  /**
   * Desvincula um poder do personagem
   */
  const desvincularPoder = useCallback((poderId: string) => {
    onPoderChange(poderes.filter(p => p.id !== poderId));
  }, [poderes, onPoderChange]);
  
  /**
   * Ativa/Desativa um poder
   */
  const togglePoderAtivo = useCallback((poderId: string) => {
    onPoderChange(
      poderes.map(p => 
        p.id === poderId 
          ? { ...p, ativo: !p.ativo, dataModificacao: new Date().toISOString() }
          : p
      )
    );
  }, [poderes, onPoderChange]);
  
  /**
   * Atualiza um poder existente (recalcula custos)
   */
  const atualizarPoder = useCallback((poderId: string, novosPoder: Poder) => {
    const poderExistente = poderes.find(p => p.id === poderId);
    if (!poderExistente) return;
    
    const { pdaCost, espacosOccupied, poderFinal } = calcularCustosComMaestria(
      novosPoder, 
      poderExistente.dominioId
    );
    
    onPoderChange(
      poderes.map(p => 
        p.id === poderId
          ? {
              ...p,
              poder: poderFinal,
              pdaCost,
              espacosOccupied,
              dataModificacao: new Date().toISOString(),
            }
          : p
      )
    );
  }, [poderes, calcularCustosComMaestria, onPoderChange]);
  
  /**
   * Calcula custos totais de PdA e Espaços
   */
  const calcularCustosTotal = useCallback(() => {
    return poderes.reduce(
      (acc, poder) => ({
        pdaTotal: acc.pdaTotal + poder.pdaCost,
        espacosTotal: acc.espacosTotal + poder.espacosOccupied,
      }),
      { pdaTotal: 0, espacosTotal: 0 }
    );
  }, [poderes]);
  
  /**
   * Obtém modificações de maestria aplicáveis
   */
  const getModificacoesMaestria = useCallback((mastery: Domain['mastery']): string[] => {
    return getModificacoesMaestriaPorNivel(mastery);
  }, []);
  
  return {
    vincularPoder,
    desvincularPoder,
    togglePoderAtivo,
    atualizarPoder,
    calcularCustosTotal,
    getModificacoesMaestria,
  };
}
