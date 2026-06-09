'use client';
import { STATUS_CONFIG } from '@/lib/utils';
import type { LaporanStatus } from '@/lib/types';

export function StatusBadge({ status }: { status: LaporanStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`badge badge-${status} badge-dot`}>
      {cfg.label}
    </span>
  );
}
