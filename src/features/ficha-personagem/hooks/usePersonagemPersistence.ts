/**
 * Hook para Persistência de Personagem
 * Gerencia autosave e carregamento de personagens
 * 
 * Segue padrão de usePoderPersistence
 */

import { useCallback, useEffect } from 'react';
import type { Personagem } from '../types';

const AUTOSAVE_KEY = 'ficha-personagem-autosave';
const LOAD_PERSONAGEM_KEY = 'ficha-personagem-carregar';

export function usePersonagemPersistence() {
  
  /**
   * Carrega estado inicial
   * 1. Verifica se há personagem pendente para carregar
   * 2. Verifica autosave
   * 3. Retorna null (componente usa padrão)
   */
  const carregarEstadoInicial = useCallback((): Personagem | null => {
    try {
      // 1. Verificar personagem pendente (vindo da biblioteca)
      const pendente = localStorage.getItem(LOAD_PERSONAGEM_KEY);
      if (pendente) {
        localStorage.removeItem(LOAD_PERSONAGEM_KEY);
        return JSON.parse(pendente);
      }
      
      // 2. Verificar autosave
      const autosave = localStorage.getItem(AUTOSAVE_KEY);
      if (autosave) {
        return JSON.parse(autosave);
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar personagem:', error);
      return null;
    }
  }, []);
  
  /**
   * Salva automaticamente o personagem
   */
  const salvarAutomaticamente = useCallback((personagem: Personagem) => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(personagem));
    } catch (error) {
      console.error('Erro ao salvar personagem:', error);
    }
  }, []);
  
  /**
   * Limpa o autosave
   */
  const limparAutosave = useCallback(() => {
    localStorage.removeItem(AUTOSAVE_KEY);
  }, []);
  
  /**
   * Prepara um personagem para ser carregado
   * (usado pela biblioteca de personagens)
   */
  const prepararParaCarregar = useCallback((personagem: Personagem) => {
    try {
      localStorage.setItem(LOAD_PERSONAGEM_KEY, JSON.stringify(personagem));
    } catch (error) {
      console.error('Erro ao preparar personagem para carregar:', error);
    }
  }, []);
  
  return {
    carregarEstadoInicial,
    salvarAutomaticamente,
    limparAutosave,
    prepararParaCarregar,
  };
}

/**
 * Hook para autosave automático
 * Salva o personagem toda vez que ele muda
 */
export function useAutosavePersonagem(personagem: Personagem) {
  const { salvarAutomaticamente } = usePersonagemPersistence();
  
  useEffect(() => {
    // Debounce para evitar muitos writes
    const timer = setTimeout(() => {
      salvarAutomaticamente(personagem);
    }, 500); // 500ms de debounce
    
    return () => clearTimeout(timer);
  }, [personagem, salvarAutomaticamente]);
}
