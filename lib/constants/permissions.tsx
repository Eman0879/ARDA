// ============================================
// FILE: lib/constants/permissions.ts
// ============================================

import { ROLES, UserRole } from './roles';

export const PERMISSIONS = {
  // Employee permissions
  VIEW_OWN_TASKS: 'view_own_tasks',
  EDIT_OWN_TASKS: 'edit_own_tasks',
  REQUEST_TIME_OFF: 'request_time_off',
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  
  // HR Employee permissions
  VIEW_ALL_EMPLOYEES: 'view_all_employees',
  EDIT_EMPLOYEES: 'edit_employees',
  CREATE_EMPLOYEES: 'create_employees',
  VIEW_LEAVE_REQUESTS: 'view_leave_requests',
  PROCESS_LEAVE_REQUESTS: 'process_leave_requests',
  MANAGE_ONBOARDING: 'manage_onboarding',
  
  // HR Head permissions
  VIEW_HR_ANALYTICS: 'view_hr_analytics',
  MANAGE_POLICIES: 'manage_policies',
  MANAGE_HR_TEAM: 'manage_hr_team',
  APPROVE_MAJOR_REQUESTS: 'approve_major_requests',
  VIEW_ALL_DEPARTMENTS: 'view_all_departments',
  
  // Dept Head permissions
  VIEW_TEAM_PERFORMANCE: 'view_team_performance',
  MANAGE_TEAM: 'manage_team',
  APPROVE_LEAVE: 'approve_leave',
  APPROVE_BUDGET: 'approve_budget',
  VIEW_DEPARTMENT_ANALYTICS: 'view_department_analytics',
  
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  VIEW_SYSTEM_LOGS: 'view_system_logs',
  MANAGE_SYSTEM_SETTINGS: 'manage_system_settings',
  FULL_ACCESS: 'full_access',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.VIEW_OWN_TASKS,
    PERMISSIONS.EDIT_OWN_TASKS,
    PERMISSIONS.REQUEST_TIME_OFF,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
  ],
  
  [ROLES.HR_EMPLOYEE]: [
    PERMISSIONS.VIEW_OWN_TASKS,
    PERMISSIONS.EDIT_OWN_TASKS,
    PERMISSIONS.REQUEST_TIME_OFF,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.VIEW_ALL_EMPLOYEES,
    PERMISSIONS.EDIT_EMPLOYEES,
    PERMISSIONS.CREATE_EMPLOYEES,
    PERMISSIONS.VIEW_LEAVE_REQUESTS,
    PERMISSIONS.PROCESS_LEAVE_REQUESTS,
    PERMISSIONS.MANAGE_ONBOARDING,
  ],
  
  [ROLES.HR_HEAD]: [
    PERMISSIONS.VIEW_OWN_TASKS,
    PERMISSIONS.EDIT_OWN_TASKS,
    PERMISSIONS.REQUEST_TIME_OFF,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.VIEW_ALL_EMPLOYEES,
    PERMISSIONS.VIEW_LEAVE_REQUESTS,
    PERMISSIONS.VIEW_HR_ANALYTICS,
    PERMISSIONS.MANAGE_POLICIES,
    PERMISSIONS.MANAGE_HR_TEAM,
    PERMISSIONS.APPROVE_MAJOR_REQUESTS,
    PERMISSIONS.VIEW_ALL_DEPARTMENTS,
  ],
  
  [ROLES.DEPT_HEAD]: [
    PERMISSIONS.VIEW_OWN_TASKS,
    PERMISSIONS.EDIT_OWN_TASKS,
    PERMISSIONS.REQUEST_TIME_OFF,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.VIEW_TEAM_PERFORMANCE,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.APPROVE_LEAVE,
    PERMISSIONS.APPROVE_BUDGET,
    PERMISSIONS.VIEW_DEPARTMENT_ANALYTICS,
  ],
  
  [ROLES.ADMIN]: [PERMISSIONS.FULL_ACCESS],
};