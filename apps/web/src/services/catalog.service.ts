import { api } from '@/lib/api';
import type { Efeito, Modificacao } from '@/data';

export async function fetchEffects(): Promise<Efeito[]> {
  const { data } = await api.get<Efeito[]>('/effects');
  return data;
}

export async function fetchModifications(): Promise<Modificacao[]> {
  const { data } = await api.get<Modificacao[]>('/modifications');
  return data;
}
