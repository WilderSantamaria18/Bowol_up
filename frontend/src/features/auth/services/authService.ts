import { httpClient } from '@/services/http';
import { AuthResponse, LoginPayload, RegisterPayload, MeResponse } from '../types';

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    return httpClient.post('/auth/register', payload);
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    return httpClient.post('/auth/login', payload);
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    return httpClient.post('/auth/refresh', { refreshToken });
  },

  async logout(refreshToken?: string): Promise<void> {
    return httpClient.post('/auth/logout', { refreshToken });
  },

  async getMe(): Promise<MeResponse> {
    return httpClient.get('/auth/me');
  },
};
