'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { laporanApi, kategoriApi } from '@/lib/api';
import { LaporanCard } from '@/components/laporan/LaporanCard';
import { Pagination } from '@/components/ui/Pagination';
import { Spinner } from '@/components/ui/Spinner';
import type { Laporan, Kategori } from '@/lib/types';
import { Search, PlusCircle, Filter, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LaporanListPage() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [kategoris, setKategoris] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 9;

  const [filters, setFilters] = useState({ search: '', status: '', kategori_id: '' });
  const [searchInput, setSearchInput] = useState('');

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: LIMIT, sort: 'newest' };
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.kategori_id) params.kategori_id = Number(filters.kategori_id);
      const { data } = await laporanApi.getAll(params);
      setLaporan(data.data);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchLaporan(); }, [fetchLaporan]);
  useEffect(() => { kategoriApi.getAll().then(r => setKategoris(r.data.data)); }, []);

  const applySearch = () => { setFilters(f => ({ ...f, search: searchInput })); setPage(1); };
  const setFilter = (k: string, v: string) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };

  return (
    <div style={{ padding: '32px 32px 48px' }} className="fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className="eyebrow" style={{ marginBottom: 6 }}>Laporan</p>
          <h1 className="display-md">Daftar Laporan</h1>
          <p className="body-sm" style={{ marginTop: 6 }}>
            {total > 0 ? `${total} laporan ditemukan` : 'Belum ada laporan'}
          </p>
        </div>
        {user && user.role === 'user' && (
          <Link href="/laporan/tambah" className="btn btn-primary">
            <PlusCircle size={18} /> Buat Laporan
          </Link>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)' }} />
            <input
              className="input" placeholder="Cari judul atau isi laporan..."
              style={{ paddingLeft: 38 }}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applySearch()}
            />
          </div>
          {/* Status */}
          <select className="select" style={{ flex: '0 0 160px' }}
            value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          {/* Kategori */}
          <select className="select" style={{ flex: '0 0 180px' }}
            value={filters.kategori_id} onChange={e => setFilter('kategori_id', e.target.value)}>
            <option value="">Semua Kategori</option>
            {kategoris.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={applySearch}>
            <Filter size={15} /> Cari
          </button>
          {(filters.search || filters.status || filters.kategori_id) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setFilters({ search:'', status:'', kategori_id:'' }); setSearchInput(''); setPage(1); }}>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}><Spinner size={36} /></div>
      ) : laporan.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <FileText size={28} color="var(--mute)" />
            </div>
            <div>
              <p style={{ fontWeight:600, color:'var(--ink-strong)', marginBottom:6 }}>Tidak ada laporan ditemukan</p>
              <p className="body-sm">Coba ubah filter pencarian Anda</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 8 }}>
            {laporan.map(l => <LaporanCard key={l.id} laporan={l} />)}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onChange={p => { setPage(p); window.scrollTo(0,0); }} />
        </>
      )}
    </div>
  );
}
