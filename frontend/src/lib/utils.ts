// src/lib/utils.ts
import type { LaporanStatus } from './types';

export const STATUS_CONFIG: Record<LaporanStatus, { label: string; color: string; bg: string; dot: string }> = {
  pending:  { label: 'Pending',  color: '#854d0e', bg: '#fef9c3', dot: '#ffae13' },
  approved: { label: 'Disetujui', color: '#14532d', bg: '#dcfce7', dot: '#00d722' },
  rejected: { label: 'Ditolak',  color: '#7f1d1d', bg: '#fee2e2', dot: '#ee1d36' },
};

export const KATEGORI_COLORS: Record<string, string> = {
  Infrastruktur:      '#7a3dff',
  Lingkungan:         '#3b89ff',
  Sosial:             '#ed52cb',
  'Pelayanan Publik': '#ff6b00',
  Keamanan:           '#00d722',
};

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Baru saja';
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} hari lalu`;
  return formatDateShort(dateStr);
}

export function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    user: 'Masyarakat', admin: 'Admin', super_admin: 'Super Admin',
  };
  return map[role] || role;
}
