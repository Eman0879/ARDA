// app/components/ManageUsersContent/EditableContactInfo.tsx
'use client';

import React from 'react';
import { Mail, Phone, MapPin, Users } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface EditableContactInfoProps {
  contactInfo: {
    email?: string;
    contactNumber?: string;
    addressLine1?: string;
    addressLine2?: string;
    district?: string;
    country?: string;
    emergencyNumber?: string;
    emergencyRelation?: string;
  };
  onUpdate: (field: string, value: any) => void;
}

interface EditFieldProps {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel';
  fullWidth?: boolean;
}

function EditField({ label, value, icon, onChange, type = 'text', fullWidth }: EditFieldProps) {
  const { colors } = useTheme();

  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="flex items-center gap-2 mb-2">
        <div className={colors.textAccent}>{icon}</div>
        <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide`}>
          {label}
        </label>
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2.5 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
      />
    </div>
  );
}

export default function EditableContactInfo({ contactInfo = {}, onUpdate }: EditableContactInfoProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h3 className={`text-base font-black ${colors.textPrimary} mb-4`}>Contact Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditField
              label="Email"
              value={contactInfo?.email}
              icon={<Mail className="h-4 w-4" />}
              onChange={(value) => onUpdate('email', value)}
              type="email"
            />
            <EditField
              label="Contact Number"
              value={contactInfo?.contactNumber}
              icon={<Phone className="h-4 w-4" />}
              onChange={(value) => onUpdate('contactNumber', value)}
              type="tel"
            />
          </div>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h3 className={`text-base font-black ${colors.textPrimary} mb-4`}>Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditField
              label="Address Line 1"
              value={contactInfo?.addressLine1}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) => onUpdate('addressLine1', value)}
              fullWidth
            />
            <EditField
              label="Address Line 2"
              value={contactInfo?.addressLine2}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) => onUpdate('addressLine2', value)}
              fullWidth
            />
            <EditField
              label="District"
              value={contactInfo?.district}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) => onUpdate('district', value)}
            />
            <EditField
              label="Country"
              value={contactInfo?.country}
              icon={<MapPin className="h-4 w-4" />}
              onChange={(value) => onUpdate('country', value)}
            />
          </div>
        </div>
      </div>

      <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h3 className={`text-base font-black ${colors.textPrimary} mb-4`}>Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EditField
              label="Emergency Contact Number"
              value={contactInfo?.emergencyNumber}
              icon={<Phone className="h-4 w-4" />}
              onChange={(value) => onUpdate('emergencyNumber', value)}
              type="tel"
            />
            <EditField
              label="Emergency Contact Relation"
              value={contactInfo?.emergencyRelation}
              icon={<Users className="h-4 w-4" />}
              onChange={(value) => onUpdate('emergencyRelation', value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
