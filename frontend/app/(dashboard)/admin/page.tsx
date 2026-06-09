'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { statistikApi, laporanApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageLoader, Spinner } from '@/components/ui/Spinner';
import type { DashboardStats, Laporan } from '@/lib/types';
import { formatDateShort, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FileText, Users, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStats = async () => {
    try {
      const { data } = await statistikApi.getDashboard();
      setStats(data.data);
    } catch { toast.error('Gagal memuat statistik'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const handleStatus = async (id: number, status: 'approved' | 'rejected') => {
    setUpdatingId(id);
    try {
      await laporanApi.updateStatus(id, status);
      toast.success(`Laporan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
      fetchStats();
    } catch { toast.error('Gagal mengubah status'); }
    finally { setUpdatingId(null); }
  };

  if (loading) return <PageLoader />;
  if (!stats) return null;

  const { summary, trend_7_hari, laporan_terbaru } = stats;

  const statCards = [
    { label: 'Total Laporan', value: summary.total_laporan, icon: <FileText size={22}/>, color:'#080808', bg:'#f0f0f0' },
    { label: 'Menunggu', value: summary.pending, icon: <Clock size={22}/>, color:'#854d0e', bg:'#fef9c3' },
    { label: 'Disetujui', value: summary.approved, icon: <CheckCircle size={22}/>, color:'#14532d', bg:'#dcfce7' },
    { label: 'Ditolak', value: summary.rejected, icon: <XCircle size={22}/>, color:'#7f1d1d', bg:'#fee2e2' },
    { label: 'Total User', value: summary.total_user, icon: <Users size={22}/>, color:'#1e3a8a', bg:'#dbeafe' },
    { label: 'Kategori', value: summary.total_kategori, icon: <TrendingUp size={22}/>, color:'#581c87', bg:'#f3e8ff' },
  ];

  const maxTrend = Math.max(...trend_7_hari.map(t => Number(t.total)), 1);

  return (
    <div style={{ padding:'32px 32px 56px' }} className="fade-in">
      <div style={{ marginBottom:28 }}>
        <p className="eyebrow" style={{ marginBottom:6 }}>Admin Panel</p>
        <h1 className="display-md">Dashboard Admin</h1>
        <p className="body-sm" style={{ marginTop:6 }}>Selamat datang, {user?.nama}. Monitor dan kelola laporan masyarakat.</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))', gap:16, marginBottom:32 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding:'20px 22px', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:46,height:46,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',color:s.color,flexShrink:0 }}>
              {s.icon}
            </div>
            <div>
              <p style={{ fontSize:26,fontWeight:600,color:'var(--ink)',lineHeight:1 }}>{s.value}</p>
              <p className="body-sm" style={{ marginTop:3 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:20, marginBottom:28 }}>
        {/* Trend Chart */}
        <div className="card" style={{ padding:'24px 28px' }}>
          <h2 className="display-xs" style={{ marginBottom:4 }}>Tren 7 Hari Terakhir</h2>
          <p className="body-sm" style={{ marginBottom:20 }}>Laporan masuk per hari</p>
          {trend_7_hari.length === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0', color:'var(--mute)', fontSize:14 }}>Belum ada data tren</div>
          ) : (
            <div style={{ display:'flex', alignItems:'flex-end', gap:10, height:160, paddingBottom:8 }}>
              {trend_7_hari.map((t, i) => {
                const h = (Number(t.total) / maxTrend) * 140;
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div title={`${t.total} laporan`} style={{ width:'100%', height:h, background:'var(--primary)', borderRadius:'3px 3px 0 0', transition:'height .3s ease', minHeight:4 }} />
                    <p style={{ fontSize:10, color:'var(--mute)', textAlign:'center' }}>
                      {new Date(t.tanggal).toLocaleDateString('id-ID', { day:'numeric', month:'short' })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Per Kategori */}
        <div className="card" style={{ padding:'24px 24px' }}>
          <h2 className="display-xs" style={{ marginBottom:4 }}>Per Kategori</h2>
          <p className="body-sm" style={{ marginBottom:16 }}>Distribusi laporan</p>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {stats.per_kategori.length === 0
              ? <p className="body-sm" style={{ textAlign:'center', padding:'20px 0' }}>Belum ada data</p>
              : stats.per_kategori.map(k => {
                  const pct = Math.round((k.total / (summary.total_laporan || 1)) * 100);
                  return (
                    <div key={k.kategori_id}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:500, color:'var(--ink-strong)' }}>{k.kategori?.nama}</span>
                        <span style={{ fontSize:13, color:'var(--mute)' }}>{k.total}</span>
                      </div>
                      <div style={{ height:6, background:'#f0f0f0', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background: k.kategori?.warna || '#7a3dff', borderRadius:3, transition:'width .4s ease' }} />
                      </div>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </div>

      {/* Tabel Laporan Terbaru */}
      <div className="card">
        <div style={{ padding:'20px 24px 0', borderBottom:'1px solid var(--hairline)' }}>
          <h2 className="display-xs" style={{ marginBottom:12 }}>Laporan Terbaru</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Judul</th><th>Kategori</th><th>Pelapor</th>
                <th>Status</th><th>Tanggal</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {laporan_terbaru.length === 0
                ? <tr><td colSpan={6} style={{ textAlign:'center', color:'var(--mute)', padding:'32px' }}>Belum ada laporan</td></tr>
                : laporan_terbaru.map(l => (
                  <tr key={l.id}>
                    <td>
                      <a href={`/laporan/${l.id}`} style={{ color:'var(--ink)', fontWeight:500, textDecoration:'none', fontSize:14 }}>
                        {truncate(l.judul, 42)}
                      </a>
                    </td>
                    <td>
                      <span className="badge-category" style={{ background: l.kategori?.warna, fontSize:11 }}>
                        {l.kategori?.nama}
                      </span>
                    </td>
                    <td style={{ fontSize:13, color:'var(--body-mid)' }}>{l.pelapor?.nama}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td style={{ fontSize:13, color:'var(--mute)', whiteSpace:'nowrap' }}>{formatDateShort(l.created_at)}</td>
                    <td>
                      {l.status === 'pending' ? (
                        <div style={{ display:'flex', gap:6 }}>
                          <button className="btn btn-sm" disabled={updatingId === l.id}
                            onClick={() => handleStatus(l.id, 'approved')}
                            style={{ background:'#dcfce7', color:'#14532d', border:'1px solid #bbf7d0', borderRadius:4, padding:'4px 10px', fontSize:12 }}>
                            {updatingId === l.id ? <Spinner size={12}/> : '✓ Setujui'}
                          </button>
                          <button className="btn btn-sm" disabled={updatingId === l.id}
                            onClick={() => handleStatus(l.id, 'rejected')}
                            style={{ background:'#fee2e2', color:'#7f1d1d', border:'1px solid #fecaca', borderRadius:4, padding:'4px 10px', fontSize:12 }}>
                            ✕ Tolak
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize:12, color:'var(--mute)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
