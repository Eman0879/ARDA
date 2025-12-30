// app/components/ManageUsersContent/EditableBasicInfo.tsx
'use client';

import React from 'react';
import { User, Briefcase, Calendar, Users, Heart, MapPin } from 'lucide-react';
import { User as UserType } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface EditableBasicInfoProps {
  user: UserType;
  departments: string[];
  onUpdate: (field: string, value: any) => void;
}

interface EditFieldProps {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  onChange: (value: string) => void;
  type?: 'text' | 'date' | 'select';
  options?: string[];
  fullWidth?: boolean;
}

function EditField({ label, value, icon, onChange, type = 'text', options, fullWidth }: EditFieldProps) {
  const { colors } = useTheme();

  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`${colors.textAccent}`}>{icon}</div>
        <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide`}>
          {label}
        </label>
      </div>
      {type === 'select' && options ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
        />
      )}
    </div>
  );
}

export default function EditableBasicInfo({ user, departments, onUpdate }: EditableBasicInfoProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;

  const genderOptions = ['Male', 'Female', 'Other'];
  const maritalOptions = ['Single', 'Married', 'Divorced', 'Widowed'];
  const religionOptions = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Other'];

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h3 className={`text-base font-black ${colors.textPrimary} mb-4`}>Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditField
              label="Full Name"
              value={user.basicDetails?.name}
              icon={<User className="h-4 w-4" />}
              onChange={(value) => onUpdate('name', value)}
            />
            <EditField
              label="Father's Name"
              value={user.basicDetails?.fatherName}
              icon={<Users className="h-4 w-4" />}
              onChange={(value) => onUpdate('fatherName', value)}
            />
            <EditField
              label="Gender"
              value={user.basicDetails?.gender === '1' ? 'Male' : user.basicDetails?.gender === '2' ? 'Female' : user.basicDetails?.gender}
              icon={<User className="h-4 w-4" />}
              onChange={(value) => onUpdate('gender', value)}
              type="select"
              options={genderOptions}
            />
            <EditField
              label="Age"
              value={user.basicDetails?.age}
              icon={<Calendar className="h-4 w-4" />}
              onChange={(value) => onUpdate('age', value)}
            />
            <EditField
              label="Marital Status"
              value={user.basicDetails?.maritalStatus}
              icon={<Heart className="h-4 w-4" />}
              onChange={(value) => onUpdate('maritalStatus', value)}
              type="select"
              options={maritalOptions}
            />
            <EditField
              label="Religion"
              value={user.basicDetails?.religion}
              icon={<User className="h-4 w-4" />}
              onChange={(value) => onUpdate('religion', value)}
              type="select"
              options={religionOptions}
            />
            <EditField
              label="Nationality"
              value={user.basicDetails?.nationality}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) => onUpdate('nationality', value)}
            />
          </div>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h3 className={`text-base font-black ${colors.textPrimary} mb-4`}>Employment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditField
              label="Employee Number"
              value={user.employeeNumber}
              icon={<Briefcase className="h-4 w-4" />}
              onChange={(value) => onUpdate('employeeNumber', value)}
            />
            <EditField
              label="Department"
              value={user.department}
              icon={<Briefcase className="h-4 w-4" />}
              onChange={(value) => onUpdate('department', value)}
              type="select"
              options={departments}
            />
            <EditField
              label="Job Title"
              value={user.title}
              icon={<Briefcase className="h-4 w-4" />}
              onChange={(value) => onUpdate('title', value)}
            />
            <EditField
              label="Joining Date"
              value={user.joiningDate ? new Date(user.joiningDate).toISOString().split('T')[0] : ''}
              icon={<Calendar className="h-4 w-4" />}
              onChange={(value) => onUpdate('joiningDate', value)}
              type="date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}