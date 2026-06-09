'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, FileText, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Format email tidak valid';
    if (!password) e.password = 'Password wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login berhasil! Selamat datang.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login gagal. Coba lagi.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #080808 0%, #1a1a2e 50%, #080808 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }} className="fade-in">
        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 80, height: 80, borderRadius: '50%', background: '#fff', overflow: 'hidden',
            marginBottom: 20, border: '2px solid rgba(255,255,255,.15)',
          }}>
            <img src="/kdm-bg.png" alt="Logo KDM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 600, color: 'white', marginBottom: 8 }}>Lapor KDM</h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 15 }}>
            Sistem Pelaporan Pengaduan Masyarakat
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,.97)', borderRadius: 12,
          boxShadow: '0 24px 64px rgba(0,0,0,.4)', overflow: 'hidden',
        }}>
          {/* Card header stripe */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #7a3dff, #ed52cb, #3b89ff)' }} />

          <div style={{ padding: '32px 36px' }}>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              Masuk ke Akun
            </h2>
            <p className="body-sm" style={{ marginBottom: 28 }}>
              Masukkan email dan password untuk melanjutkan
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Email */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--mute)' }} />
                  <input
                    id="email" type="email" className={`input ${errors.email ? 'error' : ''}`}
                    style={{ paddingLeft: 38 }}
                    placeholder="email@contoh.com"
                    value={email} onChange={(e) => { setEmail(e.target.value); setErrors(v => ({...v, email:''})); }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--mute)' }} />
                  <input
                    id="password" type={showPass ? 'text' : 'password'}
                    className={`input ${errors.password ? 'error' : ''}`}
                    style={{ paddingLeft: 38, paddingRight: 40 }}
                    placeholder="Minimal 6 karakter"
                    value={password} onChange={(e) => { setPassword(e.target.value); setErrors(v => ({...v, password:''})); }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--mute)' }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
                {loading ? (
                  <><div className="spinner" style={{ width:18,height:18,borderColor:'rgba(255,255,255,.3)',borderTopColor:'white' }} /> Masuk...</>
                ) : 'Masuk'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--hairline)' }}>
              <p className="body-sm">
                Belum punya akun?{' '}
                <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Quick login hints */}
        <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(255,255,255,.08)', borderRadius: 8, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.1)' }}>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
            Akun Demo
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {[
              { role: 'Super Admin', email: 'superadmin@laporkdm.id', pass: 'admin123' },
              { role: 'Admin', email: 'admin@laporkdm.id', pass: 'admin123' },
              { role: 'User', email: 'user@laporkdm.id', pass: 'user123' },
            ].map(a => (
              <button key={a.email} onClick={() => { setEmail(a.email); setPassword(a.pass); }}
                style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', padding:'2px 0', color:'rgba(255,255,255,.5)', fontSize:12 }}>
                <span style={{ color:'rgba(255,255,255,.3)', marginRight:6 }}>{a.role}:</span> {a.email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
