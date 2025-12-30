// ============================================
// FILE: lib/auth/permissions.ts
// ============================================

import { UserRole } from '@/lib/constants/roles';
import { Permission, ROLE_PERMISSIONS, PERMISSIONS } from '@/lib/constants/permissions';

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  
  // Admin has all permissions
  if (rolePermissions.includes(PERMISSIONS.FULL_ACCESS)) {
    return true;
  }
  
  return rolePermissions.includes(permission);
}

export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  const routePrefix = route.split('/')[1]; // Get first segment after /
  
  const roleRouteAccess: Record<string, UserRole[]> = {
    'employee': ['employee.other', 'employee.hr', 'depthead.hr', 'depthead.other', 'admin'],
    'hr-employee': ['employee.hr', 'depthead.hr', 'admin'],
    'hr-head': ['depthead.hr', 'admin'],
    'dept-head': ['depthead.other', 'admin'],
    'admin': ['admin'],
  };
  
  const allowedRoles = routeRouteAccess[routePrefix];
  return allowedRoles ? allowedRoles.includes(userRole) : false;
}

