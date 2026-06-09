'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { laporanApi, kategoriApi } from '@/lib/api';
import { PageLoader, Spinner } from '@/components/ui/Spinner';
import type { Kategori } from '@/lib/types';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export default function TambahLaporanPage() {
  const router = useRouter();
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loadingKat, setLoadingKat] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ judul: '', deskripsi: '', kategori_id: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    kategoriApi.getAll().then(r => setKategoris(r.data.data)).finally(() => setLoadingKat(false));
  }, []);

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.judul.trim() || form.judul.length < 5) e.judul = 'Judul minimal 5 karakter';
    if (!form.kategori_id) e.kategori_id = 'Pilih kategori laporan';
    if (!form.deskripsi.trim() || form.deskripsi.length < 10) e.deskripsi = 'Deskripsi minimal 10 karakter';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    const valid = Array.from(newFiles).filter(f => {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: format tidak didukung (gunakan JPG/PNG/WebP)`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name}: ukuran melebihi 5MB`); return false; }
      return true;
    });
    const total = files.length + valid.length;
    if (total > 5) { toast.error('Maksimal 5 gambar per laporan'); valid.splice(5 - files.length); }
    const newPreviews = valid.map(f => URL.createObjectURL(f));
    setFiles(prev => [...prev, ...valid]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('judul', form.judul);
      fd.append('deskripsi', form.deskripsi);
      fd.append('kategori_id', form.kategori_id);
      files.forEach(f => fd.append('gambar', f));
      const { data } = await laporanApi.create(fd);
      toast.success('Laporan berhasil dibuat!');
      router.push(`/laporan/${data.data.id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Gagal membuat laporan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingKat) return <PageLoader />;

  return (
    <div style={{ padding: '28px 32px 56px', maxWidth: 760, margin: '0 auto' }} className="fade-in">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <Link href="/laporan" style={{ display:'flex', alignItems:'center', gap:4, color:'var(--mute)', textDecoration:'none', fontSize:14, fontWeight:500 }}>
          <ArrowLeft size={16} /> Kembali
        </Link>
        <span style={{ color:'var(--hairline)' }}>/</span>
        <span style={{ fontSize:14, color:'var(--body)' }}>Buat Laporan</span>
      </div>

      <div style={{ marginBottom:24 }}>
        <p className="eyebrow" style={{ marginBottom:6 }}>Formulir Laporan</p>
        <h1 className="display-md">Buat Laporan Baru</h1>
        <p className="body-sm" style={{ marginTop:6 }}>Isi formulir berikut dengan jelas dan lengkap</p>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ height:4, background:'linear-gradient(90deg, #7a3dff, #ed52cb, #3b89ff)' }} />
        <form onSubmit={handleSubmit} style={{ padding:'28px 32px', display:'flex', flexDirection:'column', gap:22 }}>

          {/* Judul */}
          <div className="form-group">
            <label className="form-label" htmlFor="judul">Judul Laporan <span style={{color:'#ee1d36'}}>*</span></label>
            <input id="judul" className={`input ${errors.judul ? 'error' : ''}`}
              placeholder="Tuliskan judul laporan secara singkat dan jelas"
              value={form.judul} onChange={e => set('judul', e.target.value)} maxLength={255} />
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              {errors.judul ? <p className="form-error">{errors.judul}</p> : <span />}
              <p className="form-hint">{form.judul.length}/255</p>
            </div>
          </div>

          {/* Kategori */}
          <div className="form-group">
            <label className="form-label" htmlFor="kategori">Kategori <span style={{color:'#ee1d36'}}>*</span></label>
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
                <div style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:6 }}>
                  <div style={{ width:12,height:12,borderRadius:'50%',background:kat.warna }} />
                  <span style={{ fontSize:13,color:'var(--body-mid)' }}>{kat.deskripsi || kat.nama}</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label className="form-label" htmlFor="deskripsi">Deskripsi Lengkap <span style={{color:'#ee1d36'}}>*</span></label>
            <textarea id="deskripsi" className={`textarea ${errors.deskripsi ? 'error' : ''}`}
              placeholder="Jelaskan laporan Anda secara detail: lokasi, waktu kejadian, dampak yang ditimbulkan, dll."
              value={form.deskripsi} onChange={e => set('deskripsi', e.target.value)}
              style={{ minHeight:160 }} />
            {errors.deskripsi && <p className="form-error">{errors.deskripsi}</p>}
          </div>

          {/* Upload */}
          <div className="form-group">
            <label className="form-label">Lampiran Foto <span className="form-hint">(opsional, maks. 5 foto @5MB)</span></label>

            {/* Drop area */}
            {files.length < 5 && (
              <div className={`upload-area ${dragging ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}>
                <Upload size={32} color="var(--mute)" style={{ marginBottom:12 }} />
                <p style={{ fontSize:15, fontWeight:500, color:'var(--ink-strong)', marginBottom:6 }}>
                  Drag & drop gambar ke sini
                </p>
                <p className="body-sm">atau klik untuk memilih file • JPG, PNG, WebP</p>
                <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp"
                  style={{ display:'none' }} onChange={e => addFiles(e.target.files)} />
              </div>
            )}

            {/* Previews */}
            {previews.length > 0 && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:10, marginTop:12 }}>
                {previews.map((src, i) => (
                  <div key={i} style={{ position:'relative', borderRadius:6, overflow:'hidden', aspectRatio:'1', border:'1px solid var(--hairline)', background:'#f0f0f0' }}>
                    <img src={src} alt={`preview-${i}`} style={{ width:'100%',height:'100%',objectFit:'cover' }} />
                    <button type="button" onClick={() => removeFile(i)}
                      style={{ position:'absolute',top:4,right:4,width:22,height:22,borderRadius:'50%',background:'rgba(0,0,0,.6)',color:'white',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
                      <X size={12} />
                    </button>
                    <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,.5)',padding:'2px 6px' }}>
                      <p style={{ fontSize:10,color:'white',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {files[i].name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px', background:'#f0f7ff', borderRadius:6, border:'1px solid #bfdbfe' }}>
            <AlertCircle size={16} color="#146ef5" style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:13, color:'#1e40af', lineHeight:1.6 }}>
              Laporan akan berstatus <strong>Pending</strong> dan akan ditinjau oleh admin. Pastikan informasi yang Anda berikan akurat dan dapat dipertanggungjawabkan.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end', paddingTop:8, borderTop:'1px solid var(--hairline)' }}>
            <Link href="/laporan" className="btn btn-secondary">Batal</Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <><Spinner size={16} /> Mengirim...</> : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
