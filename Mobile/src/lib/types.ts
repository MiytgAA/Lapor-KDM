// src/lib/types.ts

export interface User {
  id: number;
  nama: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Kategori {
  id: number;
  nama: string;
  deskripsi: string | null;
  warna: string;
  created_at: string;
  updated_at: string;
}

export interface Gambar {
  id: number;
  laporan_id: number;
  url: string;
  filename: string;
  size_bytes: number;
  created_at: string;
}

export interface Komentar {
  id: number;
  laporan_id: number;
  user_id: number;
  isi: string;
  created_at: string;
  updated_at: string;
  penulis: Pick<User, 'id' | 'nama' | 'avatar_url' | 'role'>;
}

export interface Laporan {
  id: number;
  user_id: number;
  kategori_id: number;
  judul: string;
  deskripsi: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  pelapor: Pick<User, 'id' | 'nama' | 'email' | 'avatar_url'>;
  kategori: Pick<Kategori, 'id' | 'nama' | 'warna'>;
  gambar: Gambar[];
  komentar?: Komentar[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: string;
  user: User;
}

export type LaporanStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin' | 'super_admin';
