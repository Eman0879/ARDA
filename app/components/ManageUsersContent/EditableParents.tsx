// app/components/ManageUsersContent/EditableParents.tsx
'use client';

import React from 'react';
import { Users, User, Calendar } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface EditableParentsProps {
  parents?: {
    father: {
      name: string;
      DOB: string;
    };
    mother: {
      name: string;
      DOB: string;
    };
  };
  onUpdate: (parent: 'father' | 'mother', field: string, value: any) => void;
}

export default function EditableParents({ parents, onUpdate }: EditableParentsProps) {
  const { colors } = useTheme();

  return (
    <div className={`bg-gradient-to-br ${colors.cardBg} backdrop-blur-lg rounded-xl p-4 border ${colors.border}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-[#DC143C]/20 rounded-lg">
          <Users className="h-4 w-4 text-[#DC143C]" />
        </div>
        <h3 className={`text-base font-black ${colors.textPrimary}`}>Parents Information</h3>
      </div>

      <div className="space-y-4">
        {/* Father's Information */}
        <div className={`bg-gradient-to-br ${colors.cardBg} rounded-lg p-4 border ${colors.border}`}>
          <h4 className={`text-sm font-bold ${colors.textPrimary} mb-3 flex items-center gap-1.5`}>
            <User className="h-3.5 w-3.5" />
            Father's Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                Father's Name
              </label>
              <input
                type="text"
                value={parents?.father?.name || ''}
                onChange={(e) => onUpdate('father', 'name', e.target.value)}
                placeholder="Enter father's name"
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:border-[#0000FF] transition-all text-sm`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block flex items-center gap-1.5`}>
                <Calendar className="h-3 w-3" />
                Father's Date of Birth
              </label>
              <input
                type="date"
                value={parents?.father?.DOB ? new Date(parents.father.DOB).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdate('father', 'DOB', e.target.value)}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:border-[#0000FF] transition-all text-sm`}
              />
            </div>
          </div>
        </div>

        {/* Mother's Information */}
        <div className={`bg-gradient-to-br ${colors.cardBg} rounded-lg p-4 border ${colors.border}`}>
          <h4 className={`text-sm font-bold ${colors.textPrimary} mb-3 flex items-center gap-1.5`}>
            <User className="h-3.5 w-3.5" />
            Mother's Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                Mother's Name
              </label>
              <input
                type="text"
                value={parents?.mother?.name || ''}
                onChange={(e) => onUpdate('mother', 'name', e.target.value)}
                placeholder="Enter mother's name"
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:border-[#0000FF] transition-all text-sm`}
              />
            </div>

            <div>
              <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block flex items-center gap-1.5`}>
                <Calendar className="h-3 w-3" />
                Mother's Date of Birth
              </label>
              <input
                type="date"
                value={parents?.mother?.DOB ? new Date(parents.mother.DOB).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdate('mother', 'DOB', e.target.value)}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg ${colors.textPrimary} ${colors.inputFocusBg} focus:outline-none focus:border-[#0000FF] transition-all text-sm`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}