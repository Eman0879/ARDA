// ============================================
// FILE: lib/hooks/usePermissions.ts
// ============================================

'use client';

import { useAuth } from './useAuth';
import { Permission } from '@/lib/constants/permissions';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/auth/permissions';

export function usePermissions() {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAnyPermission(user.role, permissions);
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!user) return false;
    return hasAllPermissions(user.role, permissions);
  };

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
  };
}
