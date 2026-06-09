'use client';
import Link from 'next/link';
import { Calendar, Image } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateShort, truncate } from '@/lib/utils';
import type { Laporan } from '@/lib/types';

export function LaporanCard({ laporan }: { laporan: Laporan }) {
  const hasImage = laporan.gambar && laporan.gambar.length > 0;

  return (
    <Link href={`/laporan/${laporan.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card card-hover" style={{ height: '100%' }}>
        {/* Category color strip */}
        <div style={{ height: 4, background: laporan.kategori?.warna || '#7a3dff' }} />
        
        {/* Gambar thumbnail */}
        {hasImage && (
          <div style={{ height: 160, overflow: 'hidden', background: '#f0f0f0' }}>
            <img src={laporan.gambar[0].url} alt={laporan.judul}
              style={{ width:'100%', height:'100%', objectFit:'cover' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />
          </div>
        )}
        
        <div style={{ padding: '16px' }}>
          {/* Category + Status */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
            <span className="badge-category" style={{ background: laporan.kategori?.warna || '#7a3dff', fontSize:11 }}>
              {laporan.kategori?.nama}
            </span>
            <StatusBadge status={laporan.status} />
          </div>
          
          {/* Title */}
          <h3 style={{ fontSize:16, fontWeight:600, color:'var(--ink)', marginBottom:8, lineHeight:1.4 }}>
            {truncate(laporan.judul, 65)}
          </h3>
          
          {/* Description */}
          <p className="body-sm" style={{ marginBottom:14, lineHeight:1.6 }}>
            {truncate(laporan.deskripsi, 100)}
          </p>
          
          {/* Footer */}
          <div className="divider" style={{ marginBottom:12 }} />
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Avatar name={laporan.pelapor?.nama || 'U'} size="sm" url={laporan.pelapor?.avatar_url} />
              <span style={{ fontSize:13, color:'var(--body-mid)', fontWeight:500 }}>
                {laporan.pelapor?.nama}
              </span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:12, color:'var(--mute)', fontSize:12 }}>
              {hasImage && (
                <span style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <Image size={12} /> {laporan.gambar.length}
                </span>
              )}
              <span style={{ display:'flex', alignItems:'center', gap:3 }}>
                <Calendar size={12} /> {formatDateShort(laporan.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
