// ============================================
// FILE: app/(Dashboard)/layout.tsx
// ============================================

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    // If you're storing auth token in localStorage or cookie, check it here
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // The layout is minimal because each dashboard page (employee, admin, etc.)
  // has its own sidebar and header
  return <>{children}</>;
}