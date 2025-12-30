// app/components/ManageUsersContent/EditableIdentification.tsx
'use client';

import React from 'react';
import { IdCard, Calendar, MapPin, Heart } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface EditableIdentificationProps {
  identification: {
    CNIC?: string;
    dateOfBirth?: string;
    birthCountry?: string;
    bloodGroup?: string;
  };
  onUpdate: (field: string, value: any) => void;
}

interface EditFieldProps {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  onChange: (value: string) => void;
  type?: 'text' | 'date' | 'select';
  options?: string[];
}

function EditField({ label, value, icon, onChange, type = 'text', options }: EditFieldProps) {
  const { colors } = useTheme();

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={colors.textAccent}>{icon}</div>
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

export default function EditableIdentification({ identification = {}, onUpdate }: EditableIdentificationProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.authoritative;

  const bloodGroupOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      <div className="relative">
        <h3 className={`text-base font-black ${colors.textPrimary} mb-4`}>Identification Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditField
            label="CNIC"
            value={identification?.CNIC}
            icon={<IdCard className="h-4 w-4" />}
            onChange={(value) => onUpdate('CNIC', value)}
          />
          <EditField
            label="Date of Birth"
            value={identification?.dateOfBirth ? new Date(identification.dateOfBirth).toISOString().split('T')[0] : ''}
            icon={<Calendar className="h-4 w-4" />}
            onChange={(value) => onUpdate('dateOfBirth', value)}
            type="date"
          />
          <EditField
            label="Birth Country"
            value={identification?.birthCountry}
            icon={<MapPin className="h-4 w-4" />}
            onChange={(value) => onUpdate('birthCountry', value)}
          />
          <EditField
            label="Blood Group"
            value={identification?.bloodGroup}
            icon={<Heart className="h-4 w-4" />}
            onChange={(value) => onUpdate('bloodGroup', value)}
            type="select"
            options={bloodGroupOptions}
          />
        </div>
      </div>
    </div>
  );
}