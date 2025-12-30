// ============================================
// FILE: lib/constants/roles.ts
// ============================================

export const ROLES = {
  EMPLOYEE: 'employee.other',
  HR_EMPLOYEE: 'employee.hr',
  HR_HEAD: 'depthead.hr',
  DEPT_HEAD: 'depthead.other',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_NAMES: Record<UserRole, string> = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.HR_EMPLOYEE]: 'HR Employee',
  [ROLES.HR_HEAD]: 'HR Department Head',
  [ROLES.DEPT_HEAD]: 'Department Head',
  [ROLES.ADMIN]: 'Administrator',
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.EMPLOYEE]: 1,
  [ROLES.HR_EMPLOYEE]: 2,
  [ROLES.DEPT_HEAD]: 3,
  [ROLES.HR_HEAD]: 4,
  [ROLES.ADMIN]: 5,
};
