'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { laporanApi, komentarApi } from '@/lib/api';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { PageLoader, Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import type { Laporan } from '@/lib/types';
import { formatDateTime, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ArrowLeft, CheckCircle, XCircle, Trash2, Edit,
  Send, Calendar, Tag, User, MessageSquare, Image as ImageIcon,
} from 'lucide-react';

export default function DetailLaporanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [loading, setLoading] = useState(true);
  const [komentar, setKomentar] = useState('');
  const [sendingKom, setSendingKom] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fetchLaporan = async () => {
    try {
      const { data } = await laporanApi.getById(Number(id));
      setLaporan(data.data);
    } catch { toast.error('Laporan tidak ditemukan'); router.push('/laporan'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLaporan(); }, [id]);

  const handleStatus = async (status: 'approved' | 'rejected') => {
    if (!laporan) return;
    setUpdatingStatus(true);
    try {
      await laporanApi.updateStatus(laporan.id, status);
      toast.success(`Laporan berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`);
      fetchLaporan();
    } catch { toast.error('Gagal mengubah status'); }
    finally { setUpdatingStatus(false); }
  };

  const handleAddKomentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!komentar.trim()) return;
    setSendingKom(true);
    try {
      await laporanApi.addKomentar(Number(id), komentar.trim());
      setKomentar('');
      toast.success('Komentar ditambahkan');
      fetchLaporan();
    } catch { toast.error('Gagal menambah komentar'); }
    finally { setSendingKom(false); }
  };

  const handleDelete = async () => {
    if (!laporan) return;
    setDeleting(true);
    try {
      await laporanApi.delete(laporan.id);
      toast.success('Laporan dihapus');
      router.push('/laporan');
    } catch { toast.error('Gagal menghapus laporan'); setDeleting(false); }
  };

  if (loading) return <PageLoader />;
  if (!laporan) return null;

  const isOwner = user?.id === laporan.user_id;
  const isAdmin = user && ['admin', 'super_admin'].includes(user.role);
  const canEdit = isOwner && laporan.status === 'pending';

  return (
    <>
    <div style={{ padding: '28px 32px 56px', maxWidth: 900, margin: '0 auto' }} className="fade-in">
      {/* Breadcrumb */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24, color:'var(--mute)', fontSize:14 }}>
        <Link href="/laporan" style={{ display:'flex', alignItems:'center', gap:4, color:'var(--mute)', textDecoration:'none', fontWeight:500 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <span>/</span>
        <span style={{ color:'var(--body)' }}>Detail Laporan</span>
      </div>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ height: 5, background: laporan.kategori?.warna || '#7a3dff' }} />
        <div style={{ padding: '24px 28px' }}>
          {/* Badges */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
            <span className="badge-category" style={{ background: laporan.kategori?.warna, fontSize: 12 }}>
              <Tag size={11} style={{ marginRight: 4 }} /> {laporan.kategori?.nama}
            </span>
            <StatusBadge status={laporan.status} />
          </div>
          <h1 style={{ fontSize:26, fontWeight:600, color:'var(--ink)', lineHeight:1.3, marginBottom:16 }}>
            {laporan.judul}
          </h1>
          {/* Meta */}
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Avatar name={laporan.pelapor?.nama || 'U'} size="sm" url={laporan.pelapor?.avatar_url} />
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:'var(--ink-strong)' }}>{laporan.pelapor?.nama}</p>
                <p style={{ fontSize:11, color:'var(--mute)' }}>Pelapor</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, color:'var(--mute)', fontSize:13 }}>
              <Calendar size={14} />
              <span>{formatDateTime(laporan.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && laporan.status === 'pending' && (
          <div style={{ padding:'16px 28px', borderTop:'1px solid var(--hairline)', background:'#fafafa', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <p style={{ fontSize:13, color:'var(--body-mid)', marginRight:4 }}>Tindakan Admin:</p>
            <button className="btn btn-sm" disabled={updatingStatus}
              style={{ background:'#dcfce7', color:'#14532d', border:'1px solid #bbf7d0', borderRadius:4 }}
              onClick={() => handleStatus('approved')}>
              {updatingStatus ? <Spinner size={14}/> : <CheckCircle size={14} />} Setujui
            </button>
            <button className="btn btn-sm" disabled={updatingStatus}
              style={{ background:'#fee2e2', color:'#7f1d1d', border:'1px solid #fecaca', borderRadius:4 }}
              onClick={() => handleStatus('rejected')}>
              {updatingStatus ? <Spinner size={14}/> : <XCircle size={14} />} Tolak
            </button>
          </div>
        )}

        {/* Owner Actions */}
        {(canEdit || isOwner || isAdmin) && (
          <div style={{ padding:'12px 28px', borderTop:'1px solid var(--hairline)', display:'flex', gap:8, justifyContent:'flex-end' }}>
            {canEdit && (
              <Link href={`/laporan/${laporan.id}/edit`} className="btn btn-secondary btn-sm">
                <Edit size={14} /> Edit
              </Link>
            )}
            {(isOwner || isAdmin) && (
              <button className="btn btn-danger btn-sm" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={14} /> Hapus
              </button>
            )}
          </div>
        )}
      </div>

      {/* Deskripsi */}
      <div className="card" style={{ padding:'24px 28px', marginBottom:20 }}>
        <h2 className="display-xs" style={{ marginBottom:16 }}>Deskripsi Laporan</h2>
        <p style={{ fontSize:15, lineHeight:1.8, color:'var(--body)', whiteSpace:'pre-wrap' }}>{laporan.deskripsi}</p>
      </div>

      {/* Gallery */}
      {laporan.gambar && laporan.gambar.length > 0 && (
        <div className="card" style={{ padding:'24px 28px', marginBottom:20 }}>
          <h2 className="display-xs" style={{ marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <ImageIcon size={20} /> Lampiran Foto ({laporan.gambar.length})
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
            {laporan.gambar.map(g => (
              <div key={g.id} onClick={() => setLightbox(g.url)}
                style={{ borderRadius:6, overflow:'hidden', cursor:'pointer', aspectRatio:'4/3', background:'#f0f0f0', border:'1px solid var(--hairline)' }}>
                <img src={g.url} alt={g.filename} style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform .2s' }}
                  onMouseOver={e => (e.currentTarget.style.transform='scale(1.05)')}
                  onMouseOut={e => (e.currentTarget.style.transform='scale(1)')} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Komentar */}
      <div className="card" style={{ padding:'24px 28px' }}>
        <h2 className="display-xs" style={{ marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
          <MessageSquare size={20} /> Komentar ({laporan.komentar?.length || 0})
        </h2>

        {/* List Komentar */}
        {laporan.komentar && laporan.komentar.length > 0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:24 }}>
            {laporan.komentar.map(k => (
              <div key={k.id} style={{ display:'flex', gap:12 }}>
                <Avatar name={k.penulis?.nama || 'U'} size="sm" url={k.penulis?.avatar_url} />
                <div style={{ flex:1 }}>
                  <div style={{ background:'#f7f7f7', borderRadius:8, padding:'12px 16px', border:'1px solid var(--hairline)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:'var(--ink)' }}>{k.penulis?.nama}</span>
                      {k.penulis?.role !== 'user' && (
                        <span style={{ fontSize:10, fontWeight:600, background:'var(--primary)', color:'white', padding:'1px 6px', borderRadius:3 }}>
                          {k.penulis?.role === 'admin' ? 'Admin' : 'Super Admin'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize:14, color:'var(--body)', lineHeight:1.6 }}>{k.isi}</p>
                  </div>
                  <p style={{ fontSize:11, color:'var(--mute)', marginTop:4, paddingLeft:4 }}>{timeAgo(k.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'28px 0', color:'var(--mute)', marginBottom:20 }}>
            <MessageSquare size={32} style={{ marginBottom:8, opacity:0.3 }} />
            <p style={{ fontSize:14 }}>Belum ada komentar</p>
          </div>
        )}

        {/* Form Komentar */}
        {user && (
          <>
            <div className="divider" style={{ marginBottom:16 }} />
            <form onSubmit={handleAddKomentar} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <Avatar name={user.nama} size="sm" url={user.avatar_url} />
              <div style={{ flex:1, display:'flex', gap:10 }}>
                <textarea className="textarea" value={komentar} onChange={e => setKomentar(e.target.value)}
                  placeholder="Tulis komentar Anda..." style={{ minHeight:72, resize:'none', flex:1 }} />
                <button type="submit" className="btn btn-primary" disabled={sendingKom || !komentar.trim()} style={{ alignSelf:'flex-end' }}>
                  {sendingKom ? <Spinner size={16}/> : <Send size={16}/>}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}
        title="Hapus Laporan" message="Laporan yang dihapus tidak dapat dikembalikan. Lanjutkan?"
        confirmLabel="Ya, Hapus" loading={deleting} />
    </div>
    
    {/* Lightbox - Moved outside of fade-in container to fix stacking context issues */}
    {lightbox && (
      <div className="modal-overlay" onClick={() => setLightbox(null)} style={{ zIndex: 9999 }}>
        <img src={lightbox} alt="preview" style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:8, objectFit:'contain' }} />
      </div>
    )}
    </>
  );
}
