import { api } from '@/lib/api';
import type { CreatePoderPayload, PoderResponse, UpdatePoderPayload } from './types';

export async function fetchMyPowers(page = 1): Promise<PoderResponse[]> {
  const { data } = await api.get<PoderResponse[]>('/powers/me', { params: { page } });
  return data;
}

export async function fetchPublicPowers(page = 1): Promise<PoderResponse[]> {
  const { data } = await api.get<PoderResponse[]>('/powers', { params: { page } });
  return data;
}

export async function getPowerById(id: string): Promise<PoderResponse> {
  const { data } = await api.get<PoderResponse>(`/powers/${id}`);
  return data;
}

export async function createPower(payload: CreatePoderPayload): Promise<PoderResponse> {
  const { data } = await api.post<PoderResponse>('/powers', payload);
  return data;
}

export async function updatePower(id: string, payload: UpdatePoderPayload): Promise<PoderResponse> {
  const { data } = await api.put<PoderResponse>(`/powers/${id}`, payload);
  return data;
}

export async function deletePower(id: string): Promise<void> {
  await api.delete(`/powers/${id}`);
}

export async function copyPublicPower(powerId: string): Promise<PoderResponse> {
  const { data } = await api.post<PoderResponse>(`/powers/${powerId}/copy`);
  return data;
}
