// ============================================
// FILE: components/auth/ProtectedRoute.tsx
// ============================================

'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { canAccessRoute } from '@/lib/auth/permissions';
import { ROLE_DEFAULT_ROUTES } from '@/lib/constants/routes';

export function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user can access this route
    const currentPath = window.location.pathname;
    if (!canAccessRoute(user.role, currentPath)) {
      // Redirect to their default dashboard
      router.push(ROLE_DEFAULT_ROUTES[user.role]);
    }
  }, [user, router]);

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return <>{children}</>;
}