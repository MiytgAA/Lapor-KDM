'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/ui/Spinner';

// Layout khusus admin — redirect jika bukan admin/super_admin
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !['admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [isLoading, user, router]);

  if (isLoading) return <PageLoader />;
  if (!user || !['admin', 'super_admin'].includes(user.role)) return null;

  return <>{children}</>;
}
