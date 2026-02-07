import { useState, useCallback, useEffect } from 'react';
import type { Acervo } from '../types/acervo.types';

const STORAGE_KEY = 'acervos';

/**
 * Hook para gerenciar Acervos no localStorage
 * 
 * CRUD completo:
 * - salvarAcervo: cria ou atualiza
 * - buscarAcervo: busca por ID
 * - deletarAcervo: remove por ID
 * - listarAcervos: retorna todos
 */
export function useAcervos() {
  // Lazy initialization - carrega do localStorage apenas uma vez
  const [acervos, setAcervos] = useState<Acervo[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.error('Erro ao carregar acervos:', error);
    }
    return [];
  });

  // Sincronizar entre instâncias quando localStorage muda
  useEffect(() => {
    // Storage event: sincroniza entre tabs/janelas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setAcervos(parsed);
          }
        } catch (error) {
          console.error('Erro ao sincronizar acervos:', error);
        }
      }
    };

    // Custom event: sincroniza entre componentes na mesma página
    const handleAcervosUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Acervo[]>;
      if (customEvent.detail) {
        setAcervos(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('acervos-updated', handleAcervosUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('acervos-updated', handleAcervosUpdate);
    };
  }, []);

  // Salvar acervos no localStorage quando mudarem
  const persistirAcervos = useCallback((novosAcervos: Acervo[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novosAcervos));
      setAcervos(novosAcervos);
      // Disparar evento customizado para sincronizar outras instâncias na mesma página
      window.dispatchEvent(new CustomEvent('acervos-updated', { detail: novosAcervos }));
    } catch (error) {
      console.error('Erro ao salvar acervos:', error);
    }
  }, []);

  // Salvar ou atualizar acervo
  const salvarAcervo = useCallback((acervo: Acervo) => {
    const agora = new Date().toISOString();
    const index = acervos.findIndex(a => a.id === acervo.id);

    if (index >= 0) {
      // Atualizar existente
      const novosAcervos = [...acervos];
      novosAcervos[index] = {
        ...acervo,
        dataModificacao: agora,
      };
      persistirAcervos(novosAcervos);
    } else {
      // Criar novo
      const novoAcervo: Acervo = {
        ...acervo,
        dataCriacao: agora,
        dataModificacao: agora,
      };
      persistirAcervos([...acervos, novoAcervo]);
    }
  }, [acervos, persistirAcervos]);

  // Buscar acervo por ID
  const buscarAcervo = useCallback((id: string): Acervo | undefined => {
    return acervos.find(a => a.id === id);
  }, [acervos]);

  // Deletar acervo
  const deletarAcervo = useCallback((id: string) => {
    const novosAcervos = acervos.filter(a => a.id !== id);
    persistirAcervos(novosAcervos);
  }, [acervos, persistirAcervos]);

  // Listar todos os acervos
  const listarAcervos = useCallback((): Acervo[] => {
    return [...acervos];
  }, [acervos]);

  // Limpar todos os acervos (útil para testes)
  const limparAcervos = useCallback(() => {
    persistirAcervos([]);
  }, [persistirAcervos]);

  return {
    acervos,
    salvarAcervo,
    buscarAcervo,
    deletarAcervo,
    listarAcervos,
    limparAcervos,
  };
}
