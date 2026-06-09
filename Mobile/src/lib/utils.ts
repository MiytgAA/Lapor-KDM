// src/lib/utils.ts

export const formatDate = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const formatDateTime = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const timeAgo = (iso: string): string => {
  if (!iso) return '';
  const now = Date.now();
  const diff = now - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return formatDate(iso);
};

export const truncate = (text: string, maxLen: number): string => {
  if (!text || text.length <= maxLen) return text;
  return text.substring(0, maxLen) + '...';
};

export const getInitials = (name: string): string => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};
