import { useEffect, useState, type ReactNode } from 'react';
import type { Efeito, Modificacao } from '@/data';
import efeitosJson from '@/data/efeitos.json';
import modificacoesJson from '@/data/modificacoes.json';
import { fetchEffects, fetchModifications } from '@/services/catalog.service';
import { CatalogContext } from './catalog-context';

const EFEITOS_FALLBACK = efeitosJson as Efeito[];
const MODIFICACOES_FALLBACK = modificacoesJson as Modificacao[];

/**
 * Provê efeitos e modificações do catálogo para toda a aplicação.
 *
 * Estratégia:
 *  - Semeado com o JSON local (render imediato, sem flash de loading)
 *  - Busca da API em background e substitui os dados
 *  - Em caso de falha na API, mantém os dados do JSON local como fallback
 */
export function CatalogProvider({ children }: { children: ReactNode }) {
  const [efeitos, setEfeitos] = useState<Efeito[]>(EFEITOS_FALLBACK);
  const [modificacoes, setModificacoes] = useState<Modificacao[]>(MODIFICACOES_FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchEffects(), fetchModifications()])
      .then(([efeitosApi, modificacoesApi]) => {
        if (cancelled) return;
        if (efeitosApi.length > 0) setEfeitos(efeitosApi);
        if (modificacoesApi.length > 0) setModificacoes(modificacoesApi);
      })
      .catch(() => {
        // API indisponível: mantém fallback JSON silenciosamente
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ efeitos, modificacoes, loading }}>
      {children}
    </CatalogContext.Provider>
  );
}
