// app/components/employeeticketlogs/DonutChart.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { TicketStatusCount, STATUS_LABELS } from './types';

interface DonutChartProps {
  data: TicketStatusCount[];
  size?: number;
  strokeWidth?: number;
}

export default function DonutChart({ 
  data, 
  size = 280, 
  strokeWidth = 50 
}: DonutChartProps) {
  const { colors, cardCharacters } = useTheme();
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate total for center display
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Calculate cumulative percentages for arc positioning
  let cumulativePercentage = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={colors.scrollbarTrack}
          strokeWidth={strokeWidth}
        />

        {/* Status arcs */}
        {data.map((item, index) => {
          const startAngle = (cumulativePercentage / 100) * circumference;
          const arcLength = (item.percentage / 100) * circumference;
          cumulativePercentage += item.percentage;

          return (
            <circle
              key={item.status}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={-startAngle}
              className="transition-all duration-500"
              style={{
                filter: `drop-shadow(0 0 8px ${item.color}40)`,
              }}
            />
          );
        })}
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-4xl font-black ${cardCharacters.informative.accent}`}>{total}</div>
        <div className={`text-sm font-bold ${colors.textMuted} mt-1`}>Total Tickets</div>
      </div>
    </div>
  );
}