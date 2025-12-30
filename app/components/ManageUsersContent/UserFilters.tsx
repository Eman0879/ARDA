// app/components/ManageUsersContent/UserFilters.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { UserFilters as FilterTypes } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface UserFiltersProps {
  filters: FilterTypes;
  departments: string[];
  onFilterChange: (filters: Partial<FilterTypes>) => void;
}

export default function UserFilters({ filters, departments, onFilterChange }: UserFiltersProps) {
  const { colors } = useTheme();

  return (
    <div className={`bg-gradient-to-br ${colors.cardBg} backdrop-blur-xl rounded-xl p-4 border-2 ${colors.borderStrong}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.textMuted}`} />
            <input
              type="text"
              placeholder="Search by name, username, email, or employee #..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              className={`w-full pl-10 pr-3 py-2 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong} text-sm`}
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            value={filters.departmentFilter}
            onChange={(e) => onFilterChange({ departmentFilter: e.target.value })}
            className={`w-full px-3 py-2 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong} appearance-none cursor-pointer text-sm`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230000FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              paddingRight: '2rem'
            }}
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Approval Filter */}
        <div className="relative">
          <select
            value={filters.approvalFilter}
            onChange={(e) => onFilterChange({ approvalFilter: e.target.value as any })}
            className={`w-full px-3 py-2 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong} appearance-none cursor-pointer text-sm`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230000FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              paddingRight: '2rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="unapproved">Pending Approval</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="relative">
          <select
            value={filters.roleFilter}
            onChange={(e) => onFilterChange({ roleFilter: e.target.value as any })}
            className={`w-full px-3 py-2 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong} appearance-none cursor-pointer text-sm`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230000FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              paddingRight: '2rem'
            }}
          >
            <option value="all">All Roles</option>
            <option value="depthead">Dept Heads</option>
            <option value="employee">Employees</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as any })}
            className={`w-full px-3 py-2 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong} appearance-none cursor-pointer text-sm`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230000FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              paddingRight: '2rem'
            }}
          >
            <option value="name">Sort: Name</option>
            <option value="department">Sort: Department</option>
            <option value="employeeNumber">Sort: Employee #</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>
    </div>
  );
}