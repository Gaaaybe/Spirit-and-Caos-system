/**
 * Hook para gerenciar Poderes do Personagem
 * Integração entre Ficha de Personagem e Sistema de Poderes
 */

import { useCallback } from 'react';
import type { Poder } from '../../criador-de-poder/types';
import type { Acervo } from '../../criador-de-poder/types/acervo.types';
import type { PersonagemPoder, PersonagemAcervo } from '../types';
import { calcularDetalhesPoder } from '../../criador-de-poder/regras/calculadoraCusto';
import { calcularDetalhesAcervo } from '../../criador-de-poder/regras/calculadoraAcervo';
import { useCatalog } from '@/context/useCatalog';

// ========================================
// TIPOS
// ========================================

interface UsePersonagemPoderesProps {
  poderes: PersonagemPoder[];
  acervos: PersonagemAcervo[];
  onPoderChange: (poderes: PersonagemPoder[]) => void;
  onAcervoChange: (acervos: PersonagemAcervo[]) => void;
}

interface UsePersonagemPoderesReturn {
  // Adicionar poder ao personagem
  vincularPoder: (poder: Poder) => PersonagemPoder | null;
  
  // Remover poder
  desvincularPoder: (poderId: string) => void;
  
  // Ativar/Desativar poder
  togglePoderAtivo: (poderId: string) => void;
  
  // Atualizar poder (recalcula custos)
  atualizarPoder: (poderId: string, novosPoder: Poder) => void;
  
  // Acervos
  vincularAcervo: (acervo: Acervo) => PersonagemAcervo | null;
  desvincularAcervo: (acervoId: string) => void;
  toggleAcervoAtivo: (acervoId: string) => void;
  atualizarAcervo: (acervoId: string, novoAcervo: Acervo) => void;

  // Calcular custos totais
  calcularCustosTotal: () => { pdaTotal: number; espacosTotal: number };
}

// ========================================
// HOOK PRINCIPAL
// ========================================

export function usePersonagemPoderes({
  poderes,
  acervos,
  onPoderChange,
  onAcervoChange,
}: UsePersonagemPoderesProps): UsePersonagemPoderesReturn {
  const { efeitos, modificacoes } = useCatalog();
  
  /**
   * Calcula custos do poder
   */
  const calcularCustosPoder = useCallback((poder: Poder) => {
    const detalhes = calcularDetalhesPoder(poder, efeitos, modificacoes);
    
    return {
      pdaCost: detalhes.custoPdATotal,
      espacosOccupied: detalhes.espacosTotal,
    };
  }, [efeitos, modificacoes]);
  
  /**
   * Calcula custos do acervo
   */
  const calcularCustosAcervo = useCallback((acervo: Acervo) => {
    const detalhes = calcularDetalhesAcervo(acervo, efeitos, modificacoes);

    return {
      pdaCost: detalhes.custoPdaTotal,
      espacosOccupied: detalhes.espacosTotal,
    };
  }, [efeitos, modificacoes]);

  // ========================================
  // PODERES
  // ========================================

  /**
   * Vincula um poder ao personagem
   */
  const vincularPoder = useCallback((poder: Poder): PersonagemPoder | null => {
    // Calcular custos
    const { pdaCost, espacosOccupied } = calcularCustosPoder(poder);
    
    const agora = new Date().toISOString();
    
    const personagemPoder: PersonagemPoder = {
      id: `pp-${Date.now()}`,
      poderId: poder.id,
      poder: poder,
      ativo: true,
      pdaCost,
      espacosOccupied,
      dataCriacao: agora,
      dataModificacao: agora,
    };
    
    onPoderChange([...poderes, personagemPoder]);
    return personagemPoder;
  }, [poderes, calcularCustosPoder, onPoderChange]);
  
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
    const { pdaCost, espacosOccupied } = calcularCustosPoder(novosPoder);
    
    onPoderChange(
      poderes.map(p => 
        p.id === poderId
          ? {
              ...p,
              poder: novosPoder,
              pdaCost,
              espacosOccupied,
              dataModificacao: new Date().toISOString(),
            }
          : p
      )
    );
  }, [poderes, calcularCustosPoder, onPoderChange]);
  

  // ========================================
  // ACERVOS
  // ========================================

  /**
   * Vincula um acervo ao personagem
   */
  const vincularAcervo = useCallback((acervo: Acervo): PersonagemAcervo | null => {
    // Calcular custos
    const { pdaCost, espacosOccupied } = calcularCustosAcervo(acervo);

    const agora = new Date().toISOString();

    const personagemAcervo: PersonagemAcervo = {
      id: `pa-${Date.now()}`,
      acervoId: acervo.id,
      acervo: acervo,
      ativo: true,
      pdaCost,
      espacosOccupied,
      dataCriacao: agora,
      dataModificacao: agora,
    };

    onAcervoChange([...acervos, personagemAcervo]);
    return personagemAcervo;
  }, [acervos, calcularCustosAcervo, onAcervoChange]);

  /**
   * Desvincula um acervo do personagem
   */
  const desvincularAcervo = useCallback((acervoId: string) => {
    onAcervoChange(acervos.filter(a => a.id !== acervoId));
  }, [acervos, onAcervoChange]);

  /**
   * Ativa/Desativa um acervo
   */
  const toggleAcervoAtivo = useCallback((acervoId: string) => {
    onAcervoChange(
      acervos.map(a =>
        a.id === acervoId
          ? { ...a, ativo: !a.ativo, dataModificacao: new Date().toISOString() }
          : a
      )
    );
  }, [acervos, onAcervoChange]);

  /**
   * Atualiza um acervo existente (recalcula custos)
   */
  const atualizarAcervo = useCallback((acervoId: string, novoAcervo: Acervo) => {
    const { pdaCost, espacosOccupied } = calcularCustosAcervo(novoAcervo);
    
    onAcervoChange(
      acervos.map(a =>
        a.id === acervoId
          ? { 
              ...a, 
              acervo: novoAcervo, 
              pdaCost, 
              espacosOccupied,
              dataModificacao: new Date().toISOString() 
            }
          : a
      )
    );
  }, [acervos, calcularCustosAcervo, onAcervoChange]);

  // ========================================
  // TOTAIS
  // ========================================

  /**
   * Calcula custos totais de PdA e Espaços
   */
  const calcularCustosTotal = useCallback(() => {
    const totalPoderes = poderes.reduce(
      (acc, poder) => ({
        pdaTotal: acc.pdaTotal + poder.pdaCost,
        espacosTotal: acc.espacosTotal + poder.espacosOccupied,
      }),
      { pdaTotal: 0, espacosTotal: 0 }
    );

    const totalAcervos = acervos.reduce(
      (acc, acervo) => ({
        pdaTotal: acc.pdaTotal + acervo.pdaCost,
        espacosTotal: acc.espacosTotal + acervo.espacosOccupied,
      }),
      { pdaTotal: 0, espacosTotal: 0 }
    );

    return {
      pdaTotal: totalPoderes.pdaTotal + totalAcervos.pdaTotal,
      espacosTotal: totalPoderes.espacosTotal + totalAcervos.espacosTotal,
    };
  }, [poderes, acervos]);
  
  return {
    vincularPoder,
    desvincularPoder,
    togglePoderAtivo,
    atualizarPoder,
    vincularAcervo,
    desvincularAcervo,
    toggleAcervoAtivo,
    atualizarAcervo,
    calcularCustosTotal,
  };
}
