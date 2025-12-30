// app/components/ManageUsersContent/UserDetailTabs.tsx
'use client';

import React from 'react';
import { User, IdCard, Phone, GraduationCap, Users } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface UserDetailTabsProps {
  activeTab: 'basic' | 'identification' | 'contact' | 'education' | 'parents';
  onTabChange: (tab: 'basic' | 'identification' | 'contact' | 'education' | 'parents') => void;
}

export default function UserDetailTabs({ activeTab, onTabChange }: UserDetailTabsProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.interactive;

  const tabs = [
    { id: 'basic' as const, label: 'Basic Info', icon: User },
    { id: 'identification' as const, label: 'Identification', icon: IdCard },
    { id: 'contact' as const, label: 'Contact', icon: Phone },
    { id: 'education' as const, label: 'Education', icon: GraduationCap },
    { id: 'parents' as const, label: 'Parents', icon: Users },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all duration-300 whitespace-nowrap border-2 ${
              isActive
                ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.borderStrong} ${colors.shadowHover}`
                : `bg-gradient-to-br ${colors.cardBg} ${colors.textMuted} ${colors.border} ${colors.borderHover} hover:${colors.textPrimary}`
            }`}
          >
            {/* Paper Texture */}
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            
            {/* Hover Glow */}
            {!isActive && (
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
              ></div>
            )}
            
            <Icon className={`h-4 w-4 relative z-10 transition-transform duration-300 ${isActive ? '' : 'group-hover:scale-110'}`} />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}