// app/(Dashboard)/admin/components/ManageUsersContent/UserFilters.tsx
'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { UserFilters as FilterTypes } from './types';

interface UserFiltersProps {
  filters: FilterTypes;
  departments: string[];
  onFilterChange: (filters: Partial<FilterTypes>) => void;
}

export default function UserFilters({ filters, departments, onFilterChange }: UserFiltersProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#0000FF]/40">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, username, email, or employee #..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
              className="w-full pl-12 pr-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0000FF]"
            />
          </div>
        </div>

        {/* Department Filter */}
        <div className="relative">
          <select
            value={filters.departmentFilter}
            onChange={(e) => onFilterChange({ departmentFilter: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white focus:outline-none focus:border-[#0000FF] appearance-none cursor-pointer"
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
            className="w-full px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white focus:outline-none focus:border-[#0000FF] appearance-none cursor-pointer"
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
            className="w-full px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white focus:outline-none focus:border-[#0000FF] appearance-none cursor-pointer"
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
            className="w-full px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white focus:outline-none focus:border-[#0000FF] appearance-none cursor-pointer"
          >
            <option value="name">Sort: Name</option>
            <option value="department">Sort: Department</option>
            <option value="employeeNumber">Sort: Employee #</option>
            <option value="status">Sort: Status</option>
          </select>
        </div>
      </div>

      <style jsx>{`
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230000FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          padding-right: 2.5rem;
        }
        
        select option {
          background-color: #1a1a2e;
          color: #87CEEB;
          padding: 0.5rem;
        }
      `}</style>
    </div>
  );
}