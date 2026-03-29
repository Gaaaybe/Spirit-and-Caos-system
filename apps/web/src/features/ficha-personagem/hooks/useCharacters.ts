import { useState, useEffect } from 'react';
import { charactersService } from '@/services/characters.service';
import type { CharacterResponse } from '@/services/characters.types';
import { useAuth } from '@/context/useAuth';

export function useCharacters() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<CharacterResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCharacters();
    } else {
      setCharacters([]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await charactersService.fetchUserCharacters();
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar personagens');
    } finally {
      setIsLoading(false);
    }
  };

  const createCharacter = async (payload: Parameters<typeof charactersService.createCharacter>[0]) => {
    try {
      setError(null);
      const newChar = await charactersService.createCharacter(payload);
      setCharacters((prev) => [newChar, ...prev]);
      return newChar;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar personagem');
      throw err;
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      setError(null);
      await charactersService.deleteCharacter(id);
      setCharacters((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar personagem');
      throw err;
    }
  };

  return {
    characters,
    isLoading,
    error,
    fetchCharacters,
    createCharacter,
    deleteCharacter,
  };
}
