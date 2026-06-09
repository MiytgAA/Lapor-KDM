'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  FileText, LayoutDashboard, PlusCircle, Users,
  Tag, LogOut, ChevronRight, Shield,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/laporan', label: 'Semua Laporan', icon: <FileText size={18} /> },
  { href: '/laporan/tambah', label: 'Buat Laporan', icon: <PlusCircle size={18} />, roles: ['user'] },
  { href: '/admin', label: 'Panel Admin', icon: <Shield size={18} />, roles: ['admin', 'super_admin'] },
  { href: '/admin/users', label: 'Kelola User', icon: <Users size={18} />, roles: ['super_admin'] },
  { href: '/admin/kategori', label: 'Kategori', icon: <Tag size={18} />, roles: ['admin', 'super_admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filtered = navItems.filter(n => !n.roles || (user && n.roles.includes(user.role)));

  return (
    <nav className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#fff', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="/kdm-bg.png" alt="Logo KDM" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>Lapor KDM</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>Pengaduan Masyarakat</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-nav">
        <p className="section-label" style={{ color: 'rgba(255,255,255,.25)', marginBottom: 8, paddingLeft: 12 }}>
          Menu
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(item => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`sidebar-link ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </Link>
            );
          })}
        </div>
      </div>

      {/* User footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,.1)' }}>
        {user && (
          <div style={{ padding: '10px 12px', marginBottom: 8, borderRadius: 6, background: 'rgba(255,255,255,.06)' }}>
            <p style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{user.nama}</p>
            <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11 }}>
              {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Masyarakat'}
            </p>
          </div>
        )}
        <button onClick={logout} className="sidebar-link" style={{ color: 'rgba(255,100,100,.7)' }}>
          <LogOut size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </nav>
  );
}
