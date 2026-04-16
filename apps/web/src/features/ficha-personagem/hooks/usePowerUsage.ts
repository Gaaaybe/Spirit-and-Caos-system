import { useState, useCallback } from 'react';
import { charactersService } from '@/services/characters.service';
import type { CharacterResponse } from '@/services/characters.types';
import { toast } from '@/shared/ui';

export interface ActivePower {
  id: string;
  powerId: string;
  nome: string;
  icone?: string | null;
  duracao: number;
  peCostPerRound: number;
  activatedAt: number;
}

interface UsePowerUsageOptions {
  characterId: string;
  onCharacterUpdate: (character: CharacterResponse) => void;
}

const buildStorageKey = (characterId: string) => `active-powers-${characterId}`;

function loadActivePowers(characterId: string): ActivePower[] {
  try {
    const raw = localStorage.getItem(buildStorageKey(characterId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivePowers(characterId: string, powers: ActivePower[]): void {
  localStorage.setItem(buildStorageKey(characterId), JSON.stringify(powers));
}

export function usePowerUsage({ characterId, onCharacterUpdate }: UsePowerUsageOptions) {
  const [activePowers, setActivePowers] = useState<ActivePower[]>(() =>
    loadActivePowers(characterId),
  );
  const [isUsing, setIsUsing] = useState(false);

  const updateActive = useCallback(
    (updater: (prev: ActivePower[]) => ActivePower[]) => {
      setActivePowers(prev => {
        const next = updater(prev);
        saveActivePowers(characterId, next);
        return next;
      });
    },
    [characterId],
  );

  const usePower = useCallback(
    async (power: {
      powerId: string;
      nome: string;
      icone?: string | null;
      duracao: number;
      peCost: number;
    }) => {
      setIsUsing(true);
      try {
        const result = await charactersService.usePower(characterId, power.powerId, power.peCost);
        onCharacterUpdate(result);

        if (power.duracao >= 1) {
          const entry: ActivePower = {
            id: `${power.powerId}-${Date.now()}`,
            powerId: power.powerId,
            nome: power.nome,
            icone: power.icone,
            duracao: power.duracao,
            peCostPerRound: power.duracao === 1 || power.duracao === 2 ? Math.floor(power.peCost / 2) : 0,
            activatedAt: Date.now(),
          };
          updateActive(prev => [entry, ...prev.filter(p => p.powerId !== power.powerId)]);
        }

        if (power.peCost > 0) {
          toast.success(`${power.nome} usado! −${power.peCost} PE`);
        } else {
          toast.success(`${power.nome} ativado!`);
        }
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? 'Erro ao usar poder';
        toast.error(msg);
        throw err;
      } finally {
        setIsUsing(false);
      }
    },
    [characterId, onCharacterUpdate, updateActive],
  );

  const maintainPower = useCallback(
    async (activeId: string) => {
      const power = activePowers.find(p => p.id === activeId);
      if (!power || power.peCostPerRound <= 0) return;
      
      setIsUsing(true);
      try {
        const result = await charactersService.syncCharacter(characterId, { peChange: -power.peCostPerRound });
        onCharacterUpdate(result);
        toast.success(`${power.nome} mantido! −${power.peCostPerRound} PE`);
      } catch (err) {
        toast.error('Erro ao manter poder');
      } finally {
        setIsUsing(false);
      }
    },
    [activePowers, characterId, onCharacterUpdate]
  );

  const deactivatePower = useCallback(
    (activeId: string) => {
      updateActive(prev => prev.filter(p => p.id !== activeId));
    },
    [updateActive],
  );

  const clearAll = useCallback(() => {
    updateActive(() => []);
  }, [updateActive]);

  return { activePowers, isUsing, usePower, maintainPower, deactivatePower, clearAll };
}
