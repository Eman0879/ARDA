// ============================================
// FILE: lib/constants/routes.ts
// ============================================

import { ROLES, UserRole } from './roles';

export const ROUTE_PATHS = {
  // Auth routes
  LOGIN: '/login',
  
  // Employee routes
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_TASKS: '/employee/tasks',
  EMPLOYEE_TIME_OFF: '/employee/time-off',
  EMPLOYEE_PROFILE: '/employee/profile',
  
  // HR Employee routes
  HR_EMPLOYEE_DASHBOARD: '/hr-employee/dashboard',
  HR_EMPLOYEE_EMPLOYEES: '/hr-employee/employees',
  HR_EMPLOYEE_LEAVE_REQUESTS: '/hr-employee/leave-requests',
  HR_EMPLOYEE_ONBOARDING: '/hr-employee/onboarding',
  
  // HR Head routes
  HR_HEAD_DASHBOARD: '/hr-head/dashboard',
  HR_HEAD_ANALYTICS: '/hr-head/analytics',
  HR_HEAD_POLICIES: '/hr-head/policies',
  HR_HEAD_TEAM: '/hr-head/team',
  HR_HEAD_APPROVALS: '/hr-head/approvals',
  
  // Dept Head routes
  DEPT_HEAD_DASHBOARD: '/dept-head/dashboard',
  DEPT_HEAD_TEAM: '/dept-head/team',
  DEPT_HEAD_PERFORMANCE: '/dept-head/performance',
  DEPT_HEAD_APPROVALS: '/dept-head/approvals',
  DEPT_HEAD_BUDGET: '/dept-head/budget',
  
  // Admin routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_LOGS: '/admin/logs',
} as const;

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  [ROLES.EMPLOYEE]: ROUTE_PATHS.EMPLOYEE_DASHBOARD,
  [ROLES.HR_EMPLOYEE]: ROUTE_PATHS.HR_EMPLOYEE_DASHBOARD,
  [ROLES.HR_HEAD]: ROUTE_PATHS.HR_HEAD_DASHBOARD,
  [ROLES.DEPT_HEAD]: ROUTE_PATHS.DEPT_HEAD_DASHBOARD,
  [ROLES.ADMIN]: ROUTE_PATHS.ADMIN_DASHBOARD,
};