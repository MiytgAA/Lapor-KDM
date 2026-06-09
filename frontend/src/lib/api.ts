// src/lib/api.ts
import axios from 'axios';
import type { ApiResponse, AuthTokens, Laporan, User, Kategori, Komentar, DashboardStats, Pagination } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — pasang token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const code = error.response?.data?.code;
      if (code === 'TOKEN_EXPIRED') {
        try {
          const refresh = localStorage.getItem('refresh_token');
          if (refresh) {
            const { data } = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refresh });
            localStorage.setItem('access_token', data.data.access_token);
            error.config.headers.Authorization = `Bearer ${data.data.access_token}`;
            return api(error.config);
          }
        } catch {
          // refresh failed — logout
        }
      }
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
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
  kategori_id?: number; search?: string; sort?: string; user_id?: number;
};

export const laporanApi = {
  getAll: (params?: LaporanFilter) =>
    api.get<ApiResponse<Laporan[]>>('/laporan', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<Laporan>>(`/laporan/${id}`),
  create: (data: FormData) =>
    api.post<ApiResponse<Laporan>>('/laporan', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: Partial<Laporan>) =>
    api.put<ApiResponse<Laporan>>(`/laporan/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/laporan/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch<ApiResponse<{ id: number; status: string }>>(`/laporan/${id}/status`, { status }),
  getKomentar: (id: number) =>
    api.get<ApiResponse<Komentar[]>>(`/laporan/${id}/komentar`),
  addKomentar: (id: number, isi: string) =>
    api.post<ApiResponse<Komentar>>(`/laporan/${id}/komentar`, { isi }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get<ApiResponse<User[]>>('/users', { params }),
  getById: (id: number) =>
    api.get<ApiResponse<User>>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) =>
    api.post<ApiResponse<User>>('/users', data),
  update: (id: number, data: Partial<User>) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/users/${id}`),
};

// ── Kategori ──────────────────────────────────────────────────────────────────
export const kategoriApi = {
  getAll: () => api.get<ApiResponse<Kategori[]>>('/kategori'),
  getById: (id: number) => api.get<ApiResponse<Kategori>>(`/kategori/${id}`),
  create: (data: { nama: string; deskripsi?: string; warna?: string }) =>
    api.post<ApiResponse<Kategori>>('/kategori', data),
  update: (id: number, data: Partial<Kategori>) =>
    api.put<ApiResponse<Kategori>>(`/kategori/${id}`, data),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/kategori/${id}`),
};

// ── Komentar ──────────────────────────────────────────────────────────────────
export const komentarApi = {
  update: (id: number, isi: string) =>
    api.put<ApiResponse<Komentar>>(`/komentar/${id}`, { isi }),
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/komentar/${id}`),
};

// ── Statistik ─────────────────────────────────────────────────────────────────
export const statistikApi = {
  getDashboard: () =>
    api.get<ApiResponse<DashboardStats>>('/statistik/dashboard'),
};

export default api;
