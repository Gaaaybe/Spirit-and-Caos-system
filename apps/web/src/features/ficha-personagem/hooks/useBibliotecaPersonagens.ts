/**
 * Hook para Biblioteca de Personagens
 * CRUD de personagens salvos no localStorage
 * 
 * Segue padrão de useBibliotecaPoderes
 */

import { useCallback } from 'react';
import { useLocalStorage } from '../../../shared/hooks';
import type { Personagem, PersonagemSalvo } from '../types';
import { personagemSalvoSchema } from '../schemas/personagem.schema';

const SCHEMA_VERSION = '1.0.0';

export function useBibliotecaPersonagens() {
  const [personagens, setPersonagens] = useLocalStorage<PersonagemSalvo[]>('biblioteca-personagens', []);
  
  /**
   * Salvar ou atualizar personagem
   */
  const salvarPersonagem = useCallback((personagem: Personagem): PersonagemSalvo => {
    const agora = new Date().toISOString();
    
    // Adiciona versão do schema
    const personagemComVersion: PersonagemSalvo = {
      ...personagem,
      schemaVersion: SCHEMA_VERSION,
    };
    
    // Validar antes de salvar
    try {
      personagemSalvoSchema.parse(personagemComVersion);
    } catch (error) {
      console.error('Erro de validação ao salvar personagem:', error);
      throw new Error('Personagem inválido');
    }
    
    // Verifica se já existe
    const existe = personagens.find(p => p.id === personagem.id);
    
    if (existe) {
      // Atualiza
      const atualizado: PersonagemSalvo = {
        ...personagemComVersion,
        dataCriacao: existe.dataCriacao,
        dataModificacao: agora,
      };
      
      setPersonagens(prev => 
        prev.map(p => p.id === personagem.id ? atualizado : p)
      );
      
      return atualizado;
    } else {
      // Cria novo
      const novo: PersonagemSalvo = {
        ...personagemComVersion,
        id: personagem.id || `char-${Date.now()}`,
        dataCriacao: agora,
        dataModificacao: agora,
      };
      
      setPersonagens(prev => [...prev, novo]);
      return novo;
    }
  }, [personagens, setPersonagens]);
  
  /**
   * Buscar personagem por ID
   */
  const buscarPersonagem = useCallback((id: string): PersonagemSalvo | undefined => {
    return personagens.find(p => p.id === id);
  }, [personagens]);
  
  /**
   * Deletar personagem
   */
  const deletarPersonagem = useCallback((id: string) => {
    setPersonagens(prev => prev.filter(p => p.id !== id));
  }, [setPersonagens]);
  
  /**
   * Duplicar personagem
   */
  const duplicarPersonagem = useCallback((id: string): PersonagemSalvo | null => {
    const original = personagens.find(p => p.id === id);
    if (!original) return null;
    
    const agora = new Date().toISOString();
    const duplicado: PersonagemSalvo = {
      ...JSON.parse(JSON.stringify(original)), // Deep clone
      id: `char-${Date.now()}`,
      header: {
        ...original.header,
        name: `${original.header.name} (Cópia)`,
      },
      dataCriacao: agora,
      dataModificacao: agora,
    };
    
    setPersonagens(prev => [...prev, duplicado]);
    return duplicado;
  }, [personagens, setPersonagens]);
  
  /**
   * Exportar personagem como JSON
   */
  const exportarPersonagem = useCallback((id: string): string | null => {
    const personagem = personagens.find(p => p.id === id);
    if (!personagem) return null;
    
    return JSON.stringify(personagem, null, 2);
  }, [personagens]);
  
  /**
   * Importar personagem de JSON
   */
  const importarPersonagem = useCallback((jsonString: string): PersonagemSalvo | null => {
    try {
      const personagem = JSON.parse(jsonString);
      
      // Validar
      const validado = personagemSalvoSchema.parse(personagem);
      
      // Gerar novo ID para evitar conflitos
      const agora = new Date().toISOString();
      const importado: PersonagemSalvo = {
        ...validado,
        id: `char-${Date.now()}`,
        dataCriacao: agora,
        dataModificacao: agora,
      };
      
      setPersonagens(prev => [...prev, importado]);
      return importado;
    } catch (error) {
      console.error('Erro ao importar personagem:', error);
      return null;
    }
  }, [setPersonagens]);
  
  /**
   * Exportar toda a biblioteca
   */
  const exportarBiblioteca = useCallback((): string => {
    return JSON.stringify(personagens, null, 2);
  }, [personagens]);
  
  /**
   * Importar biblioteca completa
   */
  const importarBiblioteca = useCallback((jsonString: string): { sucesso: number; falhas: number } => {
    try {
      const biblioteca = JSON.parse(jsonString);
      
      if (!Array.isArray(biblioteca)) {
        throw new Error('Formato inválido: esperado array de personagens');
      }
      
      let sucesso = 0;
      let falhas = 0;
      
      const personagensValidos: PersonagemSalvo[] = [];
      
      for (const item of biblioteca) {
        try {
          const validado = personagemSalvoSchema.parse(item);
          personagensValidos.push(validado);
          sucesso++;
        } catch {
          falhas++;
        }
      }
      
      if (personagensValidos.length > 0) {
        setPersonagens(prev => [...prev, ...personagensValidos]);
      }
      
      return { sucesso, falhas };
    } catch (error) {
      console.error('Erro ao importar biblioteca:', error);
      return { sucesso: 0, falhas: 0 };
    }
  }, [setPersonagens]);
  
  /**
   * Limpar toda a biblioteca (com confirmação)
   */
  const limparBiblioteca = useCallback(() => {
    setPersonagens([]);
  }, [setPersonagens]);
  
  return {
    personagens,
    salvarPersonagem,
    buscarPersonagem,
    deletarPersonagem,
    duplicarPersonagem,
    exportarPersonagem,
    importarPersonagem,
    exportarBiblioteca,
    importarBiblioteca,
    limparBiblioteca,
  };
}
