'use client';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel='Hapus', loading }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Batal</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Memproses...' : confirmLabel}
          </button>
        </>
      }
    >
      <div style={{ display:'flex', gap:16, alignItems:'flex-start' }}>
        <div style={{ width:40,height:40,borderRadius:'50%',background:'#fee2e2',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
          <AlertTriangle size={20} color="#ee1d36" />
        </div>
        <div>
          <h3 className="display-xs" style={{ marginBottom:6 }}>{title}</h3>
          <p className="body-sm">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
