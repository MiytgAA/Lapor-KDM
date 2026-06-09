'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onChange }: Props) {
  if (totalPages <= 1) return null;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 0', flexWrap:'wrap', gap:12 }}>
      <p className="body-sm">Menampilkan {start}–{end} dari {total} data</p>
      <div style={{ display:'flex', gap:6 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => onChange(page-1)} disabled={page===1}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p = i + 1;
          if (totalPages > 5) {
            if (page <= 3) p = i + 1;
            else if (page >= totalPages - 2) p = totalPages - 4 + i;
            else p = page - 2 + i;
          }
          return (
            <button key={p} className={`btn btn-sm ${p===page?'btn-primary':'btn-secondary'}`} onClick={() => onChange(p)}>
              {p}
            </button>
          );
        })}
        <button className="btn btn-secondary btn-sm" onClick={() => onChange(page+1)} disabled={page===totalPages}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
