import { createContext } from 'react';
import type { Efeito, Modificacao } from '@/data';
import efeitosJson from '@/data/efeitos.json';
import modificacoesJson from '@/data/modificacoes.json';

export interface CatalogContextType {
  efeitos: Efeito[];
  modificacoes: Modificacao[];
  /** true enquanto o fetch inicial ainda não concluiu */
  loading: boolean;
}

export const CatalogContext = createContext<CatalogContextType>({
  efeitos: efeitosJson as Efeito[],
  modificacoes: modificacoesJson as Modificacao[],
  loading: false,
});
