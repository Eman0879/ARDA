// app/(Dashboard)/admin/components/ManageUsersContent/UserTableRow.tsx
'use client';

import React, { useState } from 'react';
import { Edit2, Trash2, X, Check, Eye, EyeOff, Key, CheckCircle, XCircle } from 'lucide-react';
import { User, EditUserForm } from './types';

interface UserTableRowProps {
  user: User;
  departments: string[];
  isEditing: boolean;
  editForm: EditUserForm;
  onStartEdit: (user: User) => void;
  onSaveEdit: (userId: string) => void;
  onCancelEdit: () => void;
  onEditFormChange: (form: EditUserForm) => void;
  onDelete: (userId: string) => void;
  onToggleApproval: (userId: string, currentStatus: boolean) => void;
}

export default function UserTableRow({
  user,
  departments,
  isEditing,
  editForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditFormChange,
  onDelete,
  onToggleApproval
}: UserTableRowProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordUpdate = async () => {
    if (!newPassword.trim()) {
      alert('Please enter a new password');
      return;
    }

    try {
      const response = await fetch('/api/admin/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, newPassword })
      });

      if (response.ok) {
        alert('Password updated successfully');
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        alert('Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Failed to update password');
    }
  };

  if (isEditing) {
    return (
      <tr className="hover:bg-gray-800/40 transition-colors">
        <td className="px-6 py-4 text-white font-semibold whitespace-nowrap">
          {user.employeeNumber || 'N/A'}
        </td>
        <td className="px-6 py-4 text-white font-semibold whitespace-nowrap">
          {user.basicDetails?.name || 'N/A'}
        </td>
        <td className="px-6 py-4 text-[#87CEEB] whitespace-nowrap">
          {user.username}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <select
            value={editForm.department}
            onChange={(e) => onEditFormChange({ ...editForm, department: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-[#0000FF] rounded text-white text-sm"
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => onEditFormChange({ ...editForm, title: e.target.value })}
            className="px-3 py-2 bg-gray-800 border border-[#0000FF] rounded text-white text-sm w-full"
          />
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editForm.isDeptHead || false}
              onChange={(e) => onEditFormChange({ ...editForm, isDeptHead: e.target.checked })}
              className="w-4 h-4 rounded accent-[#0000FF]"
            />
            <span className="text-white text-sm">Dept Head</span>
          </label>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={editForm.isApproved || false}
              onChange={(e) => onEditFormChange({ ...editForm, isApproved: e.target.checked })}
              className="w-4 h-4 rounded accent-[#0000FF]"
            />
            <span className="text-white text-sm">Approved</span>
          </label>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex gap-2">
            <button
              onClick={() => onSaveEdit(user._id)}
              className="p-2 bg-[#FFD700] hover:bg-[#FFA500] rounded-lg transition-all"
              title="Save"
            >
              <Check className="h-4 w-4 text-black" />
            </button>
            <button
              onClick={onCancelEdit}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
              title="Cancel"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="hover:bg-gray-800/40 transition-colors">
        <td className="px-6 py-4 text-white font-semibold whitespace-nowrap">
          {user.employeeNumber || 'N/A'}
        </td>
        <td className="px-6 py-4 text-white font-semibold whitespace-nowrap">
          {user.basicDetails?.name || 'N/A'}
        </td>
        <td className="px-6 py-4 text-[#87CEEB] whitespace-nowrap">
          {user.username}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="inline-block px-3 py-1 bg-[#0000FF]/20 text-[#87CEEB] rounded-lg text-sm font-semibold">
            {user.department}
          </span>
        </td>
        <td className="px-6 py-4 text-[#87CEEB] whitespace-nowrap">
          {user.title || 'N/A'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {user.isDeptHead ? (
            <span className="inline-block px-3 py-1 bg-[#FFD700]/20 text-[#FFD700] rounded-lg text-sm font-bold">
              Dept Head
            </span>
          ) : (
            <span className="inline-block px-3 py-1 bg-gray-700/50 text-gray-400 rounded-lg text-sm">
              Employee
            </span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={() => onToggleApproval(user._id, user.isApproved)}
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-bold transition-all ${
              user.isApproved
                ? 'bg-[#228B22]/20 text-[#90EE90] hover:bg-[#228B22]/30'
                : 'bg-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/30'
            }`}
          >
            {user.isApproved ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Approved
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Pending
              </>
            )}
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex gap-2">
            <button
              onClick={() => onStartEdit(user)}
              className="p-2 bg-[#0000FF]/20 hover:bg-[#0000FF]/40 rounded-lg transition-all"
              title="Edit User"
            >
              <Edit2 className="h-4 w-4 text-[#87CEEB]" />
            </button>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-2 bg-[#FFD700]/20 hover:bg-[#FFD700]/40 rounded-lg transition-all"
              title="Reset Password"
            >
              <Key className="h-4 w-4 text-[#FFD700]" />
            </button>
            <button
              onClick={() => onDelete(user._id)}
              className="p-2 bg-[#FF0000]/20 hover:bg-[#FF0000]/40 rounded-lg transition-all"
              title="Delete User"
            >
              <Trash2 className="h-4 w-4 text-[#FF0000]" />
            </button>
          </div>
        </td>
      </tr>

      {/* Password Modal */}
      {showPasswordModal && (
        <tr>
          <td colSpan={8}>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border-2 border-[#0000FF]/40 p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Key className="h-6 w-6 text-[#FFD700]" />
                    <h3 className="text-2xl font-black text-white">Reset Password</h3>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-all"
                  >
                    <X className="h-6 w-6 text-white" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-[#87CEEB] mb-2">User: <span className="font-bold">{user.basicDetails?.name || user.username}</span></p>
                  <p className="text-gray-400 text-sm mb-4">Enter a new password for this user</p>
                  
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#0000FF] pr-12"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700/60 rounded-lg transition-all"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordUpdate}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] rounded-xl text-white font-bold transition-all"
                  >
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}