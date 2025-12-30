// app/components/employeeticketlogs/StatusLegend.tsx
'use client';

import React from 'react';
import { TicketStatusCount, STATUS_LABELS } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface StatusLegendProps {
  data: TicketStatusCount[];
}

export default function StatusLegend({ data }: StatusLegendProps) {
  const { colors } = useTheme();

  return (
    <div className="space-y-3">
      <h3 className={`text-lg font-bold ${colors.textPrimary} mb-4`}>
        Status Breakdown
      </h3>
      <div className="space-y-2">
        {data.map((item) => {
          const statusLabel = STATUS_LABELS[item.status as keyof typeof STATUS_LABELS] || item.status;
          
          return (
            <div
              key={item.status}
              className={`group relative flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-200 overflow-hidden ${colors.cardBg} ${colors.border} hover:${colors.cardBgHover}`}
            >
              {/* Paper Texture */}
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              
              {/* Hover Glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                   style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}>
              </div>
              
              <div className="relative flex items-center gap-3 flex-1">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 10px ${item.color}60`,
                  }}
                />
                <span className={`font-bold ${colors.textPrimary} text-sm`}>
                  {statusLabel}
                </span>
              </div>

              <div className="relative flex items-center gap-4">
                <span className={`font-black ${colors.textAccent} text-lg`}>
                  {item.count}
                </span>
                <span
                  className="font-bold text-xs px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                  }}
                >
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}