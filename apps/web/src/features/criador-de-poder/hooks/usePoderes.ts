import { useState, useEffect, useCallback } from 'react';
import {
  fetchMyPowers,
  createPower,
  updatePower,
  deletePower,
  copyPublicPower,
} from '@/services/powers.service';
import type { CreatePoderPayload, PoderResponse, UpdatePoderPayload } from '@/services/types';

interface UsePoderesState {
  poderes: PoderResponse[];
  loading: boolean;
  error: string | null;
}

export function usePoderes() {
  const [state, setState] = useState<UsePoderesState>({
    poderes: [],
    loading: true, // inicia como loading para evitar flash
    error: null,
  });

  // Carga inicial via promise chain (evita setState síncrono no corpo do efeito)
  useEffect(() => {
    let cancelled = false;
    fetchMyPowers(1)
      .then((data) => {
        if (!cancelled) setState({ poderes: data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar poderes';
          setState({ poderes: [], loading: false, error: msg });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh manual — pode ser chamado explicitamente pelo componente
  const carregar = useCallback(async (page = 1) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchMyPowers(page);
      setState({ poderes: data, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar poderes';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  const criar = useCallback(async (payload: CreatePoderPayload): Promise<PoderResponse> => {
    const novo = await createPower(payload);
    setState((s) => ({ ...s, poderes: [novo, ...s.poderes] }));
    return novo;
  }, []);

  const atualizar = useCallback(
    async (id: string, payload: UpdatePoderPayload): Promise<PoderResponse> => {
      const atualizado = await updatePower(id, payload);
      setState((s) => ({
        ...s,
        poderes: s.poderes.map((p) => (p.id === id ? atualizado : p)),
      }));
      return atualizado;
    },
    [],
  );

  const deletar = useCallback(async (id: string): Promise<void> => {
    await deletePower(id);
    setState((s) => ({ ...s, poderes: s.poderes.filter((p) => p.id !== id) }));
  }, []);

  const copiar = useCallback(async (powerId: string): Promise<PoderResponse> => {
    const copia = await copyPublicPower(powerId);
    setState((s) => ({ ...s, poderes: [copia, ...s.poderes] }));
    return copia;
  }, []);

  return {
    poderes: state.poderes,
    loading: state.loading,
    error: state.error,
    carregar,
    criar,
    atualizar,
    deletar,
    copiar,
  };
}
