import { useRef, useCallback } from 'react';
import { Poder } from '../regras/calculadoraCusto';

const AUTOSAVE_KEY = 'criador-de-poder-autosave';
const LOAD_PODER_KEY = 'criador-de-poder-carregar';

export const PODER_PADRAO: Omit<Poder, 'id'> = {
  nome: 'Novo Poder',
  descricao: '',
  efeitos: [],
  modificacoesGlobais: [],
  acao: 0,
  alcance: 0,
  duracao: 0,
};

export function usePoderPersistence() {
  const foiCarregadoDeStorage = useRef(false);

  const carregarEstadoInicial = useCallback((): Poder => {
    try {
      // 1. Verifica poder pendente (vindo da biblioteca)
      const poderPendente = localStorage.getItem(LOAD_PODER_KEY);
      if (poderPendente) {
        localStorage.removeItem(LOAD_PODER_KEY);
        const poder = JSON.parse(poderPendente) as Poder;
        if (poder.id && Array.isArray(poder.efeitos)) {
          foiCarregadoDeStorage.current = true;
          return poder;
        }
      }

      // 2. Verifica auto-save
      const salvo = localStorage.getItem(AUTOSAVE_KEY);
      if (salvo) {
        const poderSalvo = JSON.parse(salvo) as Poder;
        if (poderSalvo.id && Array.isArray(poderSalvo.efeitos)) {
          foiCarregadoDeStorage.current = true;
          return poderSalvo;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar poder salvo:', error);
    }
    
    return { ...PODER_PADRAO, id: Date.now().toString() };
  }, []);

  const salvarAutomaticamente = useCallback((poder: Poder) => {
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(poder));
    } catch (error) {
      console.error('Erro ao salvar poder automaticamente:', error);
    }
  }, []);

  const limparPersistencia = useCallback(() => {
    try {
      localStorage.removeItem(AUTOSAVE_KEY);
      foiCarregadoDeStorage.current = false;
    } catch (error) {
      console.error('Erro ao limpar auto-save:', error);
    }
  }, []);

  return {
    carregarEstadoInicial,
    salvarAutomaticamente,
    limparPersistencia,
    foiCarregadoDeStorage,
  };
}
