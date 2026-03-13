import { useState, useEffect, useCallback } from 'react';
import {
  fetchMyItems,
  createItem,
  updateItem,
  deleteItem,
  copyPublicItem,
} from '@/services/items.service';
import type { CreateItemPayload, ItemResponse, UpdateItemPayload, ItemType } from '@/services/types';

interface UseItemsState {
  items: ItemResponse[];
  loading: boolean;
  error: string | null;
}

interface LoadItemsParams {
  page?: number;
  tipo?: ItemType;
}

export function useItems() {
  const [state, setState] = useState<UseItemsState>({
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    fetchMyItems({ page: 1 })
      .then((data) => {
        if (!cancelled) setState({ items: data, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar itens';
          setState({ items: [], loading: false, error: msg });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const carregar = useCallback(async (params: LoadItemsParams = {}) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchMyItems({ page: params.page ?? 1, tipo: params.tipo });
      setState({ items: data, loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao carregar itens';
      setState((s) => ({ ...s, loading: false, error: msg }));
    }
  }, []);

  const criar = useCallback(async (payload: CreateItemPayload): Promise<ItemResponse> => {
    const novo = await createItem(payload);
    setState((s) => ({ ...s, items: [novo, ...s.items] }));
    return novo;
  }, []);

  const atualizar = useCallback(
    async (id: string, payload: UpdateItemPayload): Promise<ItemResponse> => {
      const atualizado = await updateItem(id, payload);
      setState((s) => ({
        ...s,
        items: s.items.map((item) => (item.id === id ? atualizado : item)),
      }));
      return atualizado;
    },
    [],
  );

  const deletar = useCallback(async (id: string): Promise<void> => {
    await deleteItem(id);
    setState((s) => ({ ...s, items: s.items.filter((item) => item.id !== id) }));
  }, []);

  const copiar = useCallback(async (id: string): Promise<ItemResponse> => {
    const copia = await copyPublicItem(id);
    setState((s) => ({ ...s, items: [copia, ...s.items] }));
    return copia;
  }, []);

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    carregar,
    criar,
    atualizar,
    deletar,
    copiar,
  };
}
