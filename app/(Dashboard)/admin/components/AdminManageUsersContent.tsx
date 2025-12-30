// app/(Dashboard)/admin/components/AdminManageUsersContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Users, Upload } from 'lucide-react';
import UserFilters from './ManageUsersContent/UserFilters';
import UserTableRow from './ManageUsersContent/UserTableRow';
import BulkUserUpload from './ManageUsersContent/BulkUserUpload';
import { User, EditUserForm, UserFilters as FilterTypes } from './ManageUsersContent/types';

interface ManageUsersContentProps {
  initialFilter?: string;
}

export default function ManageUsersContent({ initialFilter }: ManageUsersContentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  // Filters state
  const [filters, setFilters] = useState<FilterTypes>({
    searchTerm: '',
    departmentFilter: 'all',
    approvalFilter: initialFilter === 'unapproved' ? 'unapproved' : 'all',
    roleFilter: 'all',
    sortBy: 'name'
  });

  // Edit user state
  const [editUser, setEditUser] = useState<EditUserForm>({
    department: '',
    title: '',
    isDeptHead: false,
    isApproved: false
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, filters]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/admin/departments');
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const filterAndSortUsers = () => {
    let filtered = users;

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(user =>
        user.basicDetails?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.employeeNumber?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.contactInformation?.email?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (filters.departmentFilter !== 'all') {
      filtered = filtered.filter(user => user.department === filters.departmentFilter);
    }

    // Approval filter
    if (filters.approvalFilter !== 'all') {
      filtered = filtered.filter(user => 
        filters.approvalFilter === 'approved' ? user.isApproved : !user.isApproved
      );
    }

    // Role filter
    if (filters.roleFilter !== 'all') {
      filtered = filtered.filter(user =>
        filters.roleFilter === 'depthead' ? user.isDeptHead : !user.isDeptHead
      );
    }

    // Sort with safe access
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          const nameA = a.basicDetails?.name || '';
          const nameB = b.basicDetails?.name || '';
          return nameA.localeCompare(nameB);
        case 'department':
          return (a.department || '').localeCompare(b.department || '');
        case 'employeeNumber':
          return (a.employeeNumber || '').localeCompare(b.employeeNumber || '');
        case 'status':
          return (b.isApproved ? 1 : 0) - (a.isApproved ? 1 : 0);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  const updateUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...editUser })
      });

      if (response.ok) {
        setEditingUser(null);
        fetchUsers();
        alert('User updated successfully');
      } else {
        alert('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchUsers();
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users/approval', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved: !currentStatus })
      });

      if (response.ok) {
        fetchUsers();
      } else {
        alert('Failed to update approval status');
      }
    } catch (error) {
      console.error('Error toggling approval:', error);
      alert('Failed to update approval status');
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user._id);
    setEditUser({
      department: user.department,
      title: user.title,
      isDeptHead: user.isDeptHead,
      isApproved: user.isApproved
    });
  };

  const handleFilterChange = (newFilters: Partial<FilterTypes>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 border-4 border-[#87CEEB] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white text-xl font-bold mt-6">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#0000FF]/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Users className="h-10 w-10 text-[#87CEEB]" />
            <div>
              <h2 className="text-4xl font-black text-white">Manage Users</h2>
              <p className="text-[#87CEEB] text-lg font-semibold mt-1">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                {filters.approvalFilter === 'unapproved' && ' (Pending Approval)'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-black font-bold"
          >
            <Upload className="h-5 w-5" />
            Upload Users
          </button>
        </div>
      </div>

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUserUpload
          onClose={() => setShowBulkUpload(false)}
          onSuccess={() => {
            fetchUsers();
          }}
        />
      )}

      {/* Filters */}
      <UserFilters
        filters={filters}
        departments={departments}
        onFilterChange={handleFilterChange}
      />

      {/* Users Table */}
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl border-2 border-[#0000FF]/40 overflow-hidden">
        <div className="overflow-x-auto custom-table-scrollbar">
          <table className="w-full">
            <thead className="bg-gray-950/90">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Employee #
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Title
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-black text-[#87CEEB] uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0000FF]/10">
              {filteredUsers.map((user) => (
                <UserTableRow
                  key={user._id}
                  user={user}
                  departments={departments}
                  isEditing={editingUser === user._id}
                  editForm={editUser}
                  onStartEdit={startEdit}
                  onSaveEdit={updateUser}
                  onCancelEdit={() => setEditingUser(null)}
                  onEditFormChange={setEditUser}
                  onDelete={deleteUser}
                  onToggleApproval={toggleApproval}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-[#87CEEB] text-lg font-semibold">No users found</p>
            <p className="text-gray-400 mt-2">
              {users.length === 0 
                ? 'Upload a CSV or Excel file to add users' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-table-scrollbar::-webkit-scrollbar {
          height: 8px;
          width: 8px;
        }
        .custom-table-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-table-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #0000FF, #6495ED);
          border-radius: 10px;
        }
        .custom-table-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #6495ED, #0000FF);
        }
      `}</style>
    </div>
  );
}