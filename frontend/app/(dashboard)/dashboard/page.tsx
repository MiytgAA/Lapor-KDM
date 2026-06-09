'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { laporanApi } from '@/lib/api';
import { LaporanCard } from '@/components/laporan/LaporanCard';
import { PageLoader } from '@/components/ui/Spinner';
import type { Laporan } from '@/lib/types';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchData = async () => {
      try {
        // Ambil semua laporan untuk hitung stats + 6 terbaru secara paralel
        const [allRes, latestRes] = await Promise.all([
          laporanApi.getAll({ user_id: userId, limit: 50 }),
          laporanApi.getAll({ user_id: userId, limit: 6 }),
        ]);
        const all = allRes.data.data;
        setStats({
          total: allRes.data.pagination?.total || all.length,
          pending: all.filter(l => l.status === 'pending').length,
          approved: all.filter(l => l.status === 'approved').length,
          rejected: all.filter(l => l.status === 'rejected').length,
        });
        setLaporan(latestRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]); // hanya re-run jika user ID berubah

  if (loading) return <PageLoader />;

  const statCards = [
    { label: 'Total Laporan', value: stats.total, icon: <FileText size={22} />, color: '#080808', bg: '#f0f0f0' },
    { label: 'Menunggu', value: stats.pending, icon: <Clock size={22} />, color: '#854d0e', bg: '#fef9c3' },
    { label: 'Disetujui', value: stats.approved, icon: <CheckCircle size={22} />, color: '#14532d', bg: '#dcfce7' },
    { label: 'Ditolak', value: stats.rejected, icon: <XCircle size={22} />, color: '#7f1d1d', bg: '#fee2e2' },
  ];

  return (
    <div style={{ padding: '32px 32px 48px' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Dashboard</p>
          <h1 className="display-md">Selamat datang, {user?.nama?.split(' ')[0]} 👋</h1>
          <p className="body-sm" style={{ marginTop: 6 }}>Pantau dan kelola laporan Anda di sini.</p>
        </div>
        <Link href="/laporan/tambah" className="btn btn-primary">
          <PlusCircle size={18} /> Buat Laporan
        </Link>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 600, color: 'var(--ink)', lineHeight: 1 }}>{s.value}</p>
              <p className="body-sm" style={{ marginTop: 4 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Laporan Terbaru */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: 4 }}>Laporan Terbaru</p>
            <h2 className="display-xs">Laporan Anda</h2>
          </div>
          <Link href="/laporan" className="btn btn-secondary btn-sm">Lihat Semua</Link>
        </div>

        {laporan.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={28} color="var(--mute)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--ink-strong)', marginBottom: 6 }}>Belum ada laporan</p>
                <p className="body-sm">Buat laporan pertama Anda sekarang</p>
              </div>
              <Link href="/laporan/tambah" className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> Buat Laporan
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {laporan.map(l => <LaporanCard key={l.id} laporan={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}
