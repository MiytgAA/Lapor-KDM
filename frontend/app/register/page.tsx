'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { Eye, EyeOff, FileText, User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nama: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nama.trim() || form.nama.length < 2) e.nama = 'Nama minimal 2 karakter';
    if (!form.email) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    if (!form.password || form.password.length < 6) e.password = 'Password minimal 6 karakter';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Konfirmasi password tidak cocok';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authApi.register({ nama: form.nama, email: form.email, password: form.password });
      toast.success('Registrasi berhasil! Silakan login.');
      router.push('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registrasi gagal.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'nama', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap Anda', icon: <User size={16} /> },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com', icon: <Mail size={16} /> },
    { key: 'password', label: 'Password', type: showPass ? 'text' : 'password', placeholder: 'Minimal 6 karakter', icon: <Lock size={16} /> },
    { key: 'confirmPassword', label: 'Konfirmasi Password', type: showPass ? 'text' : 'password', placeholder: 'Ulangi password', icon: <Lock size={16} /> },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #080808 0%, #1a1a2e 50%, #080808 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }} className="fade-in">
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%', background: '#fff', overflow: 'hidden',
            marginBottom: 16, border: '2px solid rgba(255,255,255,.15)' }}>
            <img src="/kdm-bg.png" alt="Logo KDM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: 'white', marginBottom: 6 }}>Lapor KDM</h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>Buat akun untuk mulai melapor</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,.97)', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,.4)', overflow: 'hidden' }}>
          <div style={{ height: 4, background: 'linear-gradient(90deg, #7a3dff, #ed52cb, #3b89ff)' }} />
          <div style={{ padding: '32px 36px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Buat Akun Baru</h2>
            <p className="body-sm" style={{ marginBottom: 24 }}>Isi data diri Anda untuk mendaftar</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {fields.map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label" htmlFor={f.key}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--mute)' }}>
                      {f.icon}
                    </span>
                    <input id={f.key} type={f.type}
                      className={`input ${errors[f.key] ? 'error' : ''}`}
                      style={{ paddingLeft: 38, paddingRight: f.key.includes('assword') ? 40 : 14 }}
                      placeholder={f.placeholder}
                      value={(form as any)[f.key]}
                      onChange={(e) => set(f.key, e.target.value)}
                    />
                    {f.key === 'password' && (
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--mute)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                  {errors[f.key] && <p className="form-error">{errors[f.key]}</p>}
                </div>
              ))}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? (
                  <><div className="spinner" style={{ width:18,height:18,borderColor:'rgba(255,255,255,.3)',borderTopColor:'white' }} /> Mendaftar...</>
                ) : 'Daftar Sekarang'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--hairline)' }}>
              <p className="body-sm">
                Sudah punya akun?{' '}
                <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Masuk di sini
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
