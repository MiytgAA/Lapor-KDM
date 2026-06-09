import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Lapor KDM — Sistem Pelaporan Pengaduan Masyarakat',
  description: 'Platform digital untuk menyampaikan pengaduan, saran, dan laporan secara mudah dan transparan.',
  keywords: ['laporan', 'pengaduan', 'masyarakat', 'KDM'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #d8d8d8',
                boxShadow: '0 4px 16px rgba(0,0,0,.10)',
              },
              success: { iconTheme: { primary: '#00d722', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ee1d36', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
