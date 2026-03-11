import { api, setToken, clearToken } from '@/lib/api';
import type { LoginPayload, LoginResponse, RegisterPayload } from './types';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth', payload);
  setToken(data.access_token);
  return data;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await api.post('/users', payload);
}

export function logout(): void {
  clearToken();
}
