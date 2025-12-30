// app/components/employeeticketlogs/AnalyticsErrorState.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AnalyticsErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function AnalyticsErrorState({ message, onRetry }: AnalyticsErrorStateProps) {
  const { colors, cardCharacters } = useTheme();
  const urgentChar = cardCharacters.urgent;

  return (
    <div className={`relative text-center py-12 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${urgentChar.border}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative">
        <AlertCircle className={`h-16 w-16 ${urgentChar.iconColor} mx-auto mb-4`} />
        <h3 className={`text-lg font-bold ${colors.textPrimary} mb-2`}>
          Failed to Load Analytics
        </h3>
        <p className={`${colors.textMuted} mb-6 max-w-md mx-auto`}>
          {message}
        </p>
        <button
          onClick={onRetry}
          className={`group relative px-6 py-2 rounded-xl font-bold transition-all overflow-hidden flex items-center gap-2 mx-auto ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} hover:${colors.shadowHover}`}
        >
          {/* Paper Texture Layer */}
          <div className={`absolute inset-0 opacity-[0.02] ${colors.paperTexture}`}></div>
          
          {/* Internal Glow Layer */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ boxShadow: `inset 0 0 20px var(--glow-primary)` }}>
          </div>
          
          <RefreshCw className="h-4 w-4 relative z-10 group-hover:rotate-180 transition-all duration-300" />
          <span className="relative z-10">Retry</span>
        </button>
      </div>
    </div>
  );
}