// src/lib/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';
import type { ApiResponse, AuthTokens, Laporan, User, Kategori, Komentar } from './types';

import Constants from 'expo-constants';

// Android emulator uses 10.0.2.2 to reach localhost on the host machine.
// Expo Go on physical device needs the local host IP of the machine running Metro.
const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api`;
  }
  return Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api'
    : 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();
console.log('[API] Base URL configured as:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token on every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — try refresh, then logout
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code;
      if (code === 'TOKEN_EXPIRED') {
        try {
          const refresh = await storage.getRefreshToken();
          if (refresh) {
            const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refresh });
            await storage.setTokens(data.data.access_token, refresh);
            error.config.headers.Authorization = `Bearer ${data.data.access_token}`;
            return api(error.config);
          }
        } catch { /* refresh failed */ }
      }
      await storage.clear();
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { nama: string; email: string; password: string }) =>
    api.post<ApiResponse<User>>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthTokens>>('/auth/login', data),
  refresh: (refresh_token: string) =>
    api.post<ApiResponse<{ access_token: string }>>('/auth/refresh', { refresh_token }),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),
};

// ── Laporan ───────────────────────────────────────────────────────────────────
export type LaporanFilter = {
  page?: number; limit?: number; status?: string;
  kategori_id?: number; search?: string; user_id?: number;
};

export const laporanApi = {
  getAll: (params?: LaporanFilter) =>
    api.get<ApiResponse<Laporan[]>>('/laporan', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Laporan>>(`/laporan/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<Laporan>>('/laporan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: Partial<Laporan>) =>
    api.put<ApiResponse<Laporan>>(`/laporan/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/laporan/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch<ApiResponse<{ id: number; status: string }>>(`/laporan/${id}/status`, { status }),
  addKomentar: (id: number, isi: string) =>
    api.post<ApiResponse<Komentar>>(`/laporan/${id}/komentar`, { isi }),
};

// ── Kategori ──────────────────────────────────────────────────────────────────
export const kategoriApi = {
  getAll: () => api.get<ApiResponse<Kategori[]>>('/kategori'),
};

export default api;
