'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { laporanApi, kategoriApi } from '@/lib/api';
import { PageLoader, Spinner } from '@/components/ui/Spinner';
import type { Laporan, Kategori } from '@/lib/types';
import toast from 'react-hot-toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function EditLaporanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [laporan, setLaporan] = useState<Laporan | null>(null);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [laporanRes, kategoriRes] = await Promise.all([
          laporanApi.getById(Number(id)),
          kategoriApi.getAll()
        ]);
        const lapData = laporanRes.data.data;
        const katData = kategoriRes.data.data;

        setLaporan(lapData);
        setKategoris(katData);
        setForm({
          judul: lapData.judul,
          deskripsi: lapData.deskripsi,
          kategori_id: String(lapData.kategori_id),
        });
      } catch (err) {
        toast.error('Laporan tidak ditemukan atau gagal memuat data');
        router.push('/laporan');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id, router]);

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.judul.trim() || form.judul.length < 5) {
      e.judul = 'Judul minimal 5 karakter';
    }
    if (!form.kategori_id) {
      e.kategori_id = 'Pilih kategori laporan';
    }
    if (!form.deskripsi.trim() || form.deskripsi.length < 10) {
      e.deskripsi = 'Deskripsi minimal 10 karakter';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await laporanApi.update(Number(id), {
        judul: form.judul,
        deskripsi: form.deskripsi,
        kategori_id: Number(form.kategori_id),
      });
      toast.success('Laporan berhasil diubah!');
      router.replace(`/laporan/${id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal mengubah laporan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!laporan) return null;

  const isOwner = user?.id === laporan.user_id;
  const canEdit = isOwner && laporan.status === 'pending';

  // Cek otorisasi, jika tidak boleh edit, tampilkan akses ditolak
  if (user && !canEdit) {
    return (
      <div style={{ padding: '56px 32px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }} className="fade-in">
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', marginBottom: 20 }}>
          <AlertCircle size={32} color="#ee1d36" />
        </div>
        <h1 className="display-sm" style={{ marginBottom: 10 }}>Akses Ditolak</h1>
        <p className="body-sm" style={{ color: 'var(--body-mid)', marginBottom: 28, lineHeight: 1.6 }}>
          Anda tidak memiliki izin untuk mengedit laporan ini. Edit hanya diperbolehkan untuk pemilik laporan dengan status laporan yang masih <strong>Pending</strong>.
        </p>
        <Link href={`/laporan/${id}`} className="btn btn-primary">
          Kembali ke Detail Laporan
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px 56px', maxWidth: 760, margin: '0 auto' }} className="fade-in">
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Link href={`/laporan/${id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--mute)', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
          <ArrowLeft size={16} /> Detail Laporan
        </Link>
        <span style={{ color: 'var(--hairline)' }}>/</span>
        <span style={{ fontSize: 14, color: 'var(--body)' }}>Edit Laporan</span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p className="eyebrow" style={{ marginBottom: 6 }}>Formulir Edit</p>
        <h1 className="display-md">Ubah Laporan</h1>
        <p className="body-sm" style={{ marginTop: 6, color: 'var(--body-mid)' }}>Perbarui informasi laporan Anda di bawah ini</p>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg, #7a3dff, #ed52cb, #3b89ff)' }} />
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}>
          
          {/* Judul */}
          <div className="form-group">
            <label className="form-label" htmlFor="judul">Judul Laporan <span style={{ color: '#ee1d36' }}>*</span></label>
            <input id="judul" className={`input ${errors.judul ? 'error' : ''}`}
              placeholder="Tuliskan judul laporan secara singkat dan jelas"
              value={form.judul} onChange={e => set('judul', e.target.value)} maxLength={255} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {errors.judul ? <p className="form-error">{errors.judul}</p> : <span />}
              <p className="form-hint">{form.judul.length}/255</p>
            </div>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label" htmlFor="kategori">Kategori <span style={{ color: '#ee1d36' }}>*</span></label>
            <select id="kategori" className={`select ${errors.kategori_id ? 'error' : ''}`}
              value={form.kategori_id} onChange={e => set('kategori_id', e.target.value)}>
              <option value="">-- Pilih Kategori --</option>
              {kategoris.map(k => (
                <option key={k.id} value={k.id}>{k.nama}</option>
              ))}
            </select>
            {errors.kategori_id && <p className="form-error">{errors.kategori_id}</p>}
            
            {/* Preview warna kategori */}
            {form.kategori_id && (() => {
              const kat = kategoris.find(k => k.id === Number(form.kategori_id));
              return kat ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', background: kat.warna }} />
                  <span style={{ fontSize: 13, color: 'var(--body-mid)' }}>{kat.deskripsi || kat.nama}</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label className="form-label" htmlFor="deskripsi">Deskripsi Lengkap <span style={{ color: '#ee1d36' }}>*</span></label>
            <textarea id="deskripsi" className={`textarea ${errors.deskripsi ? 'error' : ''}`}
              placeholder="Jelaskan laporan Anda secara detail: lokasi, waktu kejadian, dampak, dll."
              value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)}
              style={{ minHeight: 160 }} />
            {errors.deskripsi && <p className="form-error">{errors.deskripsi}</p>}
          </div>

          {/* Foto Lampiran (Read-only) */}
          {laporan.gambar && laporan.gambar.length > 0 && (
            <div className="form-group">
              <label className="form-label" style={{ marginBottom: 8 }}>Lampiran Foto saat ini <span className="form-hint">(tidak dapat diubah)</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                {laporan.gambar.map((img, i) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', aspectRatio: '1', border: '1px solid var(--hairline)', background: '#f0f0f0' }}>
                    <img src={img.url} alt={`existing-attachment-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: '#f0f7ff', borderRadius: 6, border: '1px solid #bfdbfe' }}>
            <AlertCircle size={16} color="#146ef5" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
              Laporan Anda akan tetap berstatus <strong>Pending</strong> setelah diubah dan akan ditinjau kembali oleh admin/super admin.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--hairline)' }}>
            <Link href={`/laporan/${id}`} className="btn btn-secondary">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><Spinner size={16} /> Menyimpan...</> : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
