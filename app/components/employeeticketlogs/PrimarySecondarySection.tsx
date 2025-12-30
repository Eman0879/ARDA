// app/components/employeeticketlogs/PrimarySecondarySection.tsx
'use client';

import React, { useState } from 'react';
import { Award, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { TicketCollection } from './types';
import DonutChart from './DonutChart';
import StatusLegend from './StatusLegend';
import RecentTicketsList from './RecentTicketsList';

interface PrimarySecondarySectionProps {
  type: 'primary' | 'secondary';
  data: TicketCollection;
}

export default function PrimarySecondarySection({ type, data }: PrimarySecondarySectionProps) {
  const { colors, cardCharacters } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);

  const isPrimary = type === 'primary';
  const sectionChar = isPrimary ? cardCharacters.completed : cardCharacters.informative;
  const IconComponent = isPrimary ? Award : Users;
  
  const title = isPrimary ? 'Primary Tickets' : 'Secondary Tickets';
  const description = isPrimary 
    ? 'First node assignments - Department workload indicator'
    : 'Subsequent node work - Teamwork & criticality indicator';

  if (data.total === 0) {
    return (
      <div className={`relative p-6 rounded-xl border-2 overflow-hidden bg-gradient-to-br ${sectionChar.bg} ${sectionChar.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg border ${sectionChar.border}`}>
            <IconComponent className={`h-6 w-6 ${sectionChar.iconColor}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${colors.textPrimary}`}>{title}</h3>
            <p className={`text-xs ${colors.textMuted}`}>{description}</p>
          </div>
        </div>
        <p className={`text-sm ${colors.textMuted} mt-4 text-center py-8`}>
          No {type} tickets found for this employee
        </p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl border-2 overflow-hidden bg-gradient-to-br ${sectionChar.bg} ${sectionChar.border}`}>
      {/* Paper Texture */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      <div className="relative">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full p-6 flex items-center justify-between transition-colors ${colors.buttonGhostHover}`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${sectionChar.border}`}>
              <IconComponent className={`h-7 w-7 ${sectionChar.iconColor}`} />
            </div>
            <div className="text-left">
              <h3 className={`text-xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                {title}
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${sectionChar.bg} ${sectionChar.text} ${sectionChar.border}`}>
                  {data.total}
                </span>
              </h3>
              <p className={`text-xs ${colors.textMuted} mt-1`}>{description}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className={`h-6 w-6 ${colors.textMuted} transition-transform duration-300`} />
          ) : (
            <ChevronDown className={`h-6 w-6 ${colors.textMuted} transition-transform duration-300`} />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="px-6 pb-6 space-y-6">
            {/* Chart and Legend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut Chart */}
              <div className={`relative flex items-center justify-center p-8 rounded-xl border-2 overflow-hidden ${colors.cardBg} ${colors.border}`}>
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                <div className="relative">
                  <DonutChart data={data.statusBreakdown} />
                </div>
              </div>

              {/* Status Legend */}
              <div>
                <StatusLegend data={data.statusBreakdown} />
              </div>
            </div>

            {/* Recent Tickets */}
            <RecentTicketsList tickets={data.recentTickets} />
          </div>
        )}
      </div>
    </div>
  );
}