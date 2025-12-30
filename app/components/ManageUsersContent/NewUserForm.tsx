// app/components/ManageUsersContent/NewUserForm.tsx
'use client';

import React from 'react';
import { X, User, Lock, Mail, Phone, Hash, Briefcase, Building } from 'lucide-react';
import { NewUserForm as NewUserFormType } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface NewUserFormProps {
  form: NewUserFormType;
  departments: string[];
  onFormChange: (form: NewUserFormType) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function NewUserForm({
  form,
  departments,
  onFormChange,
  onSubmit,
  onCancel
}: NewUserFormProps) {
  const { colors } = useTheme();

  return (
    <div className={`bg-gradient-to-br ${colors.cardBg} backdrop-blur-xl rounded-2xl p-8 border-2 ${colors.borderStrong}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-black ${colors.textPrimary}`}>Create New User</h3>
        <button onClick={onCancel} className={`${colors.textMuted} hover:${colors.textPrimary} transition-colors`}>
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <div>
          <h4 className={`text-lg font-bold ${colors.textAccent} mb-4 flex items-center gap-2`}>
            <User className="h-5 w-5" />
            Account Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Username (email format) *"
                value={form.username}
                onChange={(e) => onFormChange({ ...form, username: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <Mail className="h-4 w-4" />
              </span>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="Password *"
                value={form.password}
                onChange={(e) => onFormChange({ ...form, password: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <Lock className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <h4 className={`text-lg font-bold ${colors.textAccent} mb-4 flex items-center gap-2`}>
            <User className="h-5 w-5" />
            Personal Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Full Name *"
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <User className="h-4 w-4" />
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Employee Number"
                value={form.employeeNumber}
                onChange={(e) => onFormChange({ ...form, employeeNumber: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <Hash className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className={`text-lg font-bold ${colors.textAccent} mb-4 flex items-center gap-2`}>
            <Phone className="h-5 w-5" />
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => onFormChange({ ...form, email: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <Mail className="h-4 w-4" />
              </span>
            </div>
            <div className="relative">
              <input
                type="tel"
                placeholder="Contact Number"
                value={form.contactNumber}
                onChange={(e) => onFormChange({ ...form, contactNumber: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <Phone className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div>
          <h4 className={`text-lg font-bold ${colors.textAccent} mb-4 flex items-center gap-2`}>
            <Building className="h-5 w-5" />
            Employment Details
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <select
                value={form.department}
                onChange={(e) => onFormChange({ ...form, department: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong} appearance-none cursor-pointer`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230000FF' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 1rem center',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="">Select Department *</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Job Title"
                value={form.title}
                onChange={(e) => onFormChange({ ...form, title: e.target.value })}
                className={`w-full px-4 py-3 ${colors.inputBg} border-2 ${colors.inputBorder} rounded-lg ${colors.textPrimary} placeholder-gray-400 ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted}`}>
                <Briefcase className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {/* Status Toggles */}
        <div className={`bg-gradient-to-br ${colors.glassBg} rounded-xl p-4 border-2 ${colors.border}`}>
          <h4 className={`text-sm font-bold ${colors.textMuted} mb-3 uppercase tracking-wider`}>User Status</h4>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isDeptHead}
                  onChange={(e) => onFormChange({ ...form, isDeptHead: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-[#0000FF] accent-[#0000FF] cursor-pointer"
                />
              </div>
              <span className={`${colors.textPrimary} font-semibold group-hover:${colors.textAccent} transition-colors`}>Department Head</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.isApproved}
                  onChange={(e) => onFormChange({ ...form, isApproved: e.target.checked })}
                  className="w-5 h-5 rounded border-2 border-[#0000FF] accent-[#0000FF] cursor-pointer"
                />
              </div>
              <span className={`${colors.textPrimary} font-semibold group-hover:${colors.textAccent} transition-colors`}>Approved (Active)</span>
            </label>
          </div>
        </div>

        {/* Required Fields Notice */}
        <div className="bg-[#FFD700]/10 border-2 border-[#FFD700]/30 rounded-lg p-3">
          <p className="text-[#FFD700] text-sm font-semibold">
            * Required fields: Username, Password, Full Name, and Department
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-3 justify-end mt-8 pt-6 border-t-2 ${colors.border}`}>
        <button
          onClick={onCancel}
          className={`px-6 py-3 ${colors.sidebarItemBg} ${colors.sidebarItemBgHover} rounded-lg ${colors.textPrimary} font-bold transition-all`}
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-6 py-3 bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:from-[#FFA500] hover:to-[#FFD700] rounded-lg text-black font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Create User
        </button>
      </div>
    </div>
  );
}