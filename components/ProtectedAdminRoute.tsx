'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'admin') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  if (!isAuthenticated || userRole !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
