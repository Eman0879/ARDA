// app/components/employeeticketlogs/AnalyticsEmptyState.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Inbox } from 'lucide-react';

interface AnalyticsEmptyStateProps {
  employeeName: string;
}

export default function AnalyticsEmptyState({ employeeName }: AnalyticsEmptyStateProps) {
  const { colors, cardCharacters } = useTheme();
  const neutralChar = cardCharacters.neutral;

  return (
    <div className={`relative text-center py-16 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${colors.border}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative">
        <Inbox className={`h-20 w-20 ${colors.textMuted} mx-auto mb-4 opacity-50`} />
        <h3 className={`text-xl font-bold ${colors.textPrimary} mb-2`}>
          No Tickets Yet
        </h3>
        <p className={`${colors.textMuted} max-w-md mx-auto`}>
          {employeeName} hasn't worked on any tickets yet. When they do, their ticket analytics will appear here.
        </p>
      </div>
    </div>
  );
}