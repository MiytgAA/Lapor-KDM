'use client';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  url?: string | null;
}

export function Avatar({ name, size = 'md', url }: AvatarProps) {
  if (url) {
    return <img src={url} alt={name} className={`avatar avatar-${size}`} style={{ objectFit: 'cover' }} />;
  }
  return <div className={`avatar avatar-${size}`}>{getInitials(name)}</div>;
}
