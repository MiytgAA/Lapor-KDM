'use client';
import { useState, useEffect } from 'react';
import { kategoriApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Spinner } from '@/components/ui/Spinner';
import type { Kategori } from '@/lib/types';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

const PRESET_COLORS = [
  { label:'Infrastruktur', color:'#7a3dff' },
  { label:'Lingkungan',    color:'#3b89ff' },
  { label:'Sosial',        color:'#ed52cb' },
  { label:'Pelayanan',     color:'#ff6b00' },
  { label:'Keamanan',      color:'#00d722' },
];

const EMPTY_FORM = { nama:'', deskripsi:'', warna:'#7a3dff' };

export default function ManajemenKategoriPage() {
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Kategori | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Kategori | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKategoris = async () => {
    setLoading(true);
    try {
      const { data } = await kategoriApi.getAll();
      setKategoris(data.data);
    } catch { toast.error('Gagal memuat kategori'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchKategoris(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditTarget(null); setModalMode('create'); };
  const openEdit = (k: Kategori) => {
    setForm({ nama:k.nama, deskripsi:k.deskripsi||'', warna:k.warna||'#7a3dff' });
    setFormErrors({}); setEditTarget(k); setModalMode('edit');
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim() || form.nama.length < 2) e.nama = 'Nama kategori minimal 2 karakter';
    if (form.warna && !/^#[0-9A-Fa-f]{6}$/.test(form.warna)) e.warna = 'Format warna harus #RRGGBB';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await kategoriApi.create({ nama:form.nama, deskripsi:form.deskripsi, warna:form.warna });
        toast.success('Kategori berhasil dibuat');
      } else if (editTarget) {
        await kategoriApi.update(editTarget.id, { nama:form.nama, deskripsi:form.deskripsi, warna:form.warna });
        toast.success('Kategori berhasil diperbarui');
      }
      setModalMode(null);
      fetchKategoris();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await kategoriApi.delete(deleteTarget.id);
      toast.success('Kategori dihapus');
      setDeleteTarget(null);
      fetchKategoris();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ padding:'32px 32px 56px' }} className="fade-in">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom:6 }}>Admin Panel</p>
          <h1 className="display-md">Manajemen Kategori</h1>
          <p className="body-sm" style={{ marginTop:6 }}>{kategoris.length} kategori tersedia</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Tambah Kategori</button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:64 }}><Spinner size={32}/></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
          {kategoris.map(k => (
            <div key={k.id} className="card" style={{ overflow:'hidden' }}>
              {/* Color top bar */}
              <div style={{ height:6, background:k.warna }} />
              <div style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:k.warna+'22',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      <Tag size={20} color={k.warna} />
                    </div>
                    <div>
                      <h3 style={{ fontSize:16, fontWeight:600, color:'var(--ink)', marginBottom:2 }}>{k.nama}</h3>
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div style={{ width:10,height:10,borderRadius:'50%',background:k.warna }} />
                        <span style={{ fontSize:12, color:'var(--mute)', fontFamily:'monospace' }}>{k.warna}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(k)}><Edit2 size={13}/></button>
                    <button className="btn btn-sm" style={{ background:'#fee2e2',color:'#7f1d1d',border:'1px solid #fecaca',borderRadius:4 }}
                      onClick={() => setDeleteTarget(k)}><Trash2 size={13}/></button>
                  </div>
                </div>
                {k.deskripsi && (
                  <p className="body-sm" style={{ marginTop:12, lineHeight:1.6 }}>{k.deskripsi}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      <Modal isOpen={!!modalMode} onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalMode(null)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><Spinner size={14}/> Menyimpan...</> : 'Simpan'}
            </button>
          </>
        }
      >
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div className="form-group">
            <label className="form-label">Nama Kategori</label>
            <input className={`input ${formErrors.nama ? 'error' : ''}`} placeholder="cth: Infrastruktur"
              value={form.nama} onChange={e => { setForm(v => ({...v, nama:e.target.value})); setFormErrors(v => ({...v, nama:''})); }} />
            {formErrors.nama && <p className="form-error">{formErrors.nama}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi (opsional)</label>
            <textarea className="textarea" placeholder="Deskripsi singkat kategori ini..."
              style={{ minHeight:80 }} value={form.deskripsi}
              onChange={e => setForm(v => ({...v, deskripsi:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Warna</label>
            {/* Preset colors */}
            <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
              {PRESET_COLORS.map(p => (
                <button key={p.color} type="button" title={p.label}
                  onClick={() => setForm(v => ({...v, warna:p.color}))}
                  style={{ width:32,height:32,borderRadius:8,background:p.color,border: form.warna===p.color ? '3px solid var(--primary)':'2px solid transparent',cursor:'pointer',transition:'border .15s' }} />
              ))}
            </div>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <input type="color" value={form.warna} onChange={e => setForm(v => ({...v, warna:e.target.value}))}
                style={{ width:40,height:36,padding:2,border:'1px solid var(--hairline)',borderRadius:4,cursor:'pointer' }} />
              <input className={`input ${formErrors.warna ? 'error' : ''}`} style={{ fontFamily:'monospace' }}
                value={form.warna} onChange={e => { setForm(v => ({...v, warna:e.target.value})); setFormErrors(v => ({...v, warna:''})); }}
                placeholder="#7a3dff" maxLength={7} />
            </div>
            {formErrors.warna && <p className="form-error">{formErrors.warna}</p>}
            {/* Preview */}
            <div style={{ marginTop:10, padding:'10px 14px', borderRadius:6, background:form.warna+'15', border:`1px solid ${form.warna}40`, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:12,height:12,borderRadius:'50%',background:form.warna }} />
              <span style={{ fontSize:13, color:'var(--body)' }}>Preview: <strong>{form.nama || 'Kategori'}</strong></span>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Hapus Kategori"
        message={`Kategori "${deleteTarget?.nama}" akan dihapus. Laporan yang sudah menggunakan kategori ini tidak dapat dihapus jika masih memiliki laporan terkait.`}
        confirmLabel="Hapus" loading={deleting} />
    </div>
  );
}
