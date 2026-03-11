import { useMemo } from 'react';
import type { PoderSalvo } from '../types';
import { poderResponseToPoderSalvo } from '../utils/poderApiConverter';
import { usePoderes } from './usePoderes';

/**
 * Thin wrapper sobre usePoderes que expõe a lista de poderes no formato interno
 * (PoderSalvo) para componentes que precisam do tipo legado PT-BR.
 *
 * Para salvar/atualizar/deletar poderes, usar usePoderes diretamente.
 */
export function useBibliotecaPoderes() {
  const { poderes: poderResponses } = usePoderes();

  const poderes = useMemo(
    () => poderResponses.map(poderResponseToPoderSalvo),
    [poderResponses],
  );

  const buscarPoderComHydration = (id: string): { poder: PoderSalvo | undefined } => {
    const poder = poderes.find((p) => p.id === id);
    return { poder };
  };

  return {
    poderes,
    buscarPoderComHydration,
  };
}
