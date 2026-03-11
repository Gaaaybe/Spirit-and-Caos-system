import { useState, useEffect, useCallback } from 'react';
import {
  fetchMyPowerArrays,
  createPowerArray,
  updatePowerArray,
  deletePowerArray,
} from '@/services/powerArrays.service';
import type { AcervoResponse, CreateAcervoPayload, UpdateAcervoPayload } from '@/services/types';

interface UsePowerArraysState {
  acervos: AcervoResponse[];
  loading: boolean;
  error: string | null;
}

export function usePowerArrays() {
  const [state, setState] = useState<UsePowerArraysState>({
    acervos: [],
    loading: true, // inicia como loading para evitar flash
    error: null,
  });

  // Carga inicial via promise chain (evita setState síncrono no corpo do efeito)
  useEffect(() => {
    let cancelled = false;
    fetchMyPowerArrays(1)
      .then((data) => {
        if (!cancelled) setState({ acervos: data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar acervos';
          setState({ acervos: [], loading: false, error: msg });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh manual
  const carregar = useCallback(async (page = 1) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchMyPowerArrays(page);
      setState({ acervos: data, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar acervos';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  const criar = useCallback(async (payload: CreateAcervoPayload): Promise<AcervoResponse> => {
    const novo = await createPowerArray(payload);
    setState((s) => ({ ...s, acervos: [novo, ...s.acervos] }));
    return novo;
  }, []);

  const atualizar = useCallback(
    async (id: string, payload: UpdateAcervoPayload): Promise<AcervoResponse> => {
      const atualizado = await updatePowerArray(id, payload);
      setState((s) => ({
        ...s,
        acervos: s.acervos.map((a) => (a.id === id ? atualizado : a)),
      }));
      return atualizado;
    },
    [],
  );

  const deletar = useCallback(async (id: string): Promise<void> => {
    await deletePowerArray(id);
    setState((s) => ({ ...s, acervos: s.acervos.filter((a) => a.id !== id) }));
  }, []);

  return {
    acervos: state.acervos,
    loading: state.loading,
    error: state.error,
    carregar,
    criar,
    atualizar,
    deletar,
  };
}
