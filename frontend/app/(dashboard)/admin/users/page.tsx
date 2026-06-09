'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import type { User } from '@/lib/types';
import { formatDateShort, roleLabel } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  user:        { bg: '#f0f0f0', color: '#363636' },
  admin:       { bg: '#dbeafe', color: '#1e3a8a' },
  super_admin: { bg: '#f3e8ff', color: '#581c87' },
};

const EMPTY_FORM = { nama:'', email:'', password:'', role:'user' as User['role'], is_active: true };

export default function ManajemenUserPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (me && me.role !== 'super_admin') router.push('/admin');
  }, [me, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: LIMIT };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const { data } = await userApi.getAll(params);
      setUsers(data.data);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { toast.error('Gagal memuat data user'); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => { setForm(EMPTY_FORM); setFormErrors({}); setEditTarget(null); setModalMode('create'); };
  const openEdit = (u: User) => {
    setForm({ nama:u.nama, email:u.email, password:'', role:u.role, is_active:u.is_active });
    setFormErrors({}); setEditTarget(u); setModalMode('edit');
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim() || form.nama.length < 2) e.nama = 'Nama minimal 2 karakter';
    if (!form.email) e.email = 'Email wajib diisi';
    if (modalMode === 'create' && (!form.password || form.password.length < 6)) e.password = 'Password minimal 6 karakter';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (modalMode === 'create') {
        await userApi.create({ nama:form.nama, email:form.email, password:form.password, role:form.role });
        toast.success('User berhasil dibuat');
      } else if (editTarget) {
        const payload: Record<string, any> = { nama:form.nama, email:form.email, role:form.role, is_active:form.is_active };
        if (form.password) payload.password = form.password;
        await userApi.update(editTarget.id, payload);
        toast.success('User berhasil diperbarui');
      }
      setModalMode(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await userApi.delete(deleteTarget.id);
      toast.success('User dinonaktifkan');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Gagal menghapus'); }
    finally { setDeleting(false); }
  };

  return (
    <div style={{ padding:'32px 32px 56px' }} className="fade-in">
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom:6 }}>Admin Panel</p>
          <h1 className="display-md">Manajemen User</h1>
          <p className="body-sm" style={{ marginTop:6 }}>{total} user terdaftar</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18}/> Tambah User</button>
      </div>

      {/* Filter */}
      <div className="card" style={{ padding:'14px 20px', marginBottom:20 }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <div style={{ position:'relative', flex:'1 1 220px' }}>
            <Search size={15} style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', color:'var(--mute)' }} />
            <input className="input" style={{ paddingLeft:35 }} placeholder="Cari nama atau email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="select" style={{ flex:'0 0 150px' }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">Semua Role</option>
            <option value="user">Masyarakat</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>User</th><th>Role</th><th>Status</th><th>Terdaftar</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40 }}><Spinner size={24}/></td></tr>
                : users.length === 0
                ? <tr><td colSpan={6} style={{ textAlign:'center', padding:40, color:'var(--mute)' }}>Tidak ada user ditemukan</td></tr>
                : users.map((u, i) => {
                    const rc = ROLE_COLORS[u.role] || ROLE_COLORS.user;
                    return (
                      <tr key={u.id}>
                        <td style={{ color:'var(--mute)', fontSize:13 }}>{(page-1)*LIMIT+i+1}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <Avatar name={u.nama} size="sm" url={u.avatar_url} />
                            <div>
                              <p style={{ fontSize:14, fontWeight:600, color:'var(--ink)' }}>{u.nama}</p>
                              <p style={{ fontSize:12, color:'var(--mute)' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge" style={{ background:rc.bg, color:rc.color }}>{roleLabel(u.role)}</span>
                        </td>
                        <td>
                          <span className="badge" style={{ background: u.is_active ? '#dcfce7' : '#f0f0f0', color: u.is_active ? '#14532d' : '#898989' }}>
                            {u.is_active ? '● Aktif' : '○ Nonaktif'}
                          </span>
                        </td>
                        <td style={{ fontSize:13, color:'var(--mute)' }}>{formatDateShort(u.created_at)}</td>
                        <td>
                          <div style={{ display:'flex', gap:6 }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}><Edit2 size={13}/></button>
                            {u.id !== me?.id && (
                              <button className="btn btn-sm" style={{ background:'#fee2e2', color:'#7f1d1d', border:'1px solid #fecaca', borderRadius:4 }}
                                onClick={() => setDeleteTarget(u)}><Trash2 size={13}/></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
        <div style={{ padding:'0 20px' }}>
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onChange={setPage} />
        </div>
      </div>

      {/* Modal Create/Edit */}
      <Modal isOpen={!!modalMode} onClose={() => setModalMode(null)}
        title={modalMode === 'create' ? 'Tambah User Baru' : 'Edit User'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalMode(null)} disabled={saving}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><Spinner size={14}/> Menyimpan...</> : 'Simpan'}
            </button>
          </>
        }
      >
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {[
            { key:'nama', label:'Nama Lengkap', type:'text', placeholder:'Nama lengkap' },
            { key:'email', label:'Email', type:'email', placeholder:'email@contoh.com' },
            { key:'password', label: modalMode==='edit' ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password', type:'password', placeholder:'Minimal 6 karakter' },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input type={f.type} className={`input ${formErrors[f.key] ? 'error' : ''}`}
                placeholder={f.placeholder} value={(form as any)[f.key]}
                onChange={e => { setForm(v => ({...v, [f.key]: e.target.value})); setFormErrors(v => ({...v, [f.key]:''})); }} />
              {formErrors[f.key] && <p className="form-error">{formErrors[f.key]}</p>}
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="select" value={form.role} onChange={e => setForm(v => ({...v, role: e.target.value as User['role']}))}>
              <option value="user">Masyarakat</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          {modalMode === 'edit' && (
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <input type="checkbox" id="is_active" checked={form.is_active}
                onChange={e => setForm(v => ({...v, is_active: e.target.checked}))}
                style={{ width:16, height:16, accentColor:'var(--primary)' }} />
              <label htmlFor="is_active" className="form-label" style={{ margin:0, cursor:'pointer' }}>Akun Aktif</label>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete} title="Nonaktifkan User"
        message={`Akun "${deleteTarget?.nama}" akan dinonaktifkan. User tidak dapat login sampai diaktifkan kembali.`}
        confirmLabel="Nonaktifkan" loading={deleting} />
    </div>
  );
}
