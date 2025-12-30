// app/components/employeeticketlogs/EmployeeTicketModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, TrendingUp, Award, Users, Info } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { EmployeeTicketModalProps, TicketAnalytics } from './types';
import PrimarySecondarySection from './PrimarySecondarySection';
import AnalyticsLoadingState from './AnalyticsLoadingState';
import AnalyticsErrorState from './AnalyticsErrorState';
import AnalyticsEmptyState from './AnalyticsEmptyState';

export default function EmployeeTicketModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  employeeTitle,
}: EmployeeTicketModalProps) {
  const { colors, cardCharacters } = useTheme();
  const [analytics, setAnalytics] = useState<TicketAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchAnalytics();
    }
  }, [isOpen, employeeId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/employee-tickets?employeeId=${encodeURIComponent(employeeId)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching ticket analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`
            relative w-full max-w-7xl max-h-[90vh] overflow-y-auto
            rounded-2xl border-2 ${colors.shadowDropdown} pointer-events-auto
            transform transition-all duration-300 backdrop-blur-md
            ${colors.borderStrong}
          `}
          onClick={(e) => e.stopPropagation()}
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: `${colors.scrollbarThumb} ${colors.scrollbarTrack}`,
          }}
        >
          {/* Paper Texture */}
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] rounded-2xl`}></div>
          
          <div className={`relative bg-gradient-to-br ${colors.cardBg} rounded-2xl`}>
            {/* Header */}
            <div className={`sticky top-0 z-10 border-b-2 p-6 backdrop-blur-md bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${colors.shadowCard}`}>
                    <User className={`h-8 w-8 ${cardCharacters.informative.iconColor}`} />
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${colors.textPrimary} flex items-center gap-2`}>
                      {employeeName}
                      <TrendingUp className={`h-6 w-6 ${cardCharacters.informative.iconColor}`} />
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Briefcase className={`h-4 w-4 ${cardCharacters.informative.iconColor}`} />
                      <p className={`text-sm font-semibold ${cardCharacters.informative.accent}`}>
                        {employeeTitle}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className={`group relative p-2 rounded-xl transition-all overflow-hidden border ${colors.buttonGhost} ${colors.buttonGhostText} ${colors.buttonGhostHover} ${colors.borderSubtle}`}
                >
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <X className={`h-6 w-6 relative z-10 group-hover:rotate-90 transition-all duration-300`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {loading ? (
                <AnalyticsLoadingState />
              ) : error ? (
                <AnalyticsErrorState message={error} onRetry={fetchAnalytics} />
              ) : analytics && analytics.totalTickets === 0 ? (
                <AnalyticsEmptyState employeeName={employeeName} />
              ) : analytics ? (
                <AnalyticsContent analytics={analytics} />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Separate component for analytics content
function AnalyticsContent({ analytics }: { analytics: TicketAnalytics }) {
  const { colors, cardCharacters } = useTheme();
  const completedChar = cardCharacters.completed;
  const infoChar = cardCharacters.informative;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className={`relative p-6 rounded-xl border-2 overflow-hidden bg-gradient-to-br ${infoChar.bg} ${infoChar.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative flex items-center justify-between mb-4">
          <div>
            <p className={`text-sm font-semibold ${colors.textMuted} mb-1`}>Total Tickets Worked On</p>
            <p className={`text-5xl font-black ${infoChar.accent}`}>{analytics.totalTickets}</p>
          </div>
          <TrendingUp className={`h-16 w-16 ${infoChar.iconColor} opacity-50`} />
        </div>
        
        {/* Breakdown Summary */}
        <div className="relative grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-opacity-20" style={{ borderColor: infoChar.border }}>
          <div className={`relative flex items-center gap-3 p-4 rounded-xl border overflow-hidden bg-gradient-to-br ${completedChar.bg} ${completedChar.border}`}>
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            <Award className={`h-8 w-8 ${completedChar.iconColor} relative z-10`} />
            <div className="relative z-10">
              <p className={`text-xs font-semibold ${colors.textMuted}`}>Primary Tickets</p>
              <p className={`text-3xl font-black ${completedChar.accent}`}>{analytics.primaryTickets.total}</p>
              <p className={`text-xs ${colors.textMuted} mt-1`}>Department workload</p>
            </div>
          </div>
          <div className={`relative flex items-center gap-3 p-4 rounded-xl border overflow-hidden bg-gradient-to-br ${infoChar.bg} ${infoChar.border}`}>
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            <Users className={`h-8 w-8 ${infoChar.iconColor} relative z-10`} />
            <div className="relative z-10">
              <p className={`text-xs font-semibold ${colors.textMuted}`}>Secondary Tickets</p>
              <p className={`text-3xl font-black ${infoChar.accent}`}>{analytics.secondaryTickets.total}</p>
              <p className={`text-xs ${colors.textMuted} mt-1`}>Teamwork contribution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className={`relative p-4 rounded-xl border-2 overflow-hidden flex items-start gap-3 ${colors.cardBg} ${infoChar.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <Info className={`h-5 w-5 ${infoChar.iconColor} flex-shrink-0 mt-0.5 relative z-10`} />
        <div className={`text-sm ${colors.textSecondary} relative z-10`}>
          <p className="font-semibold mb-2">Understanding Primary vs Secondary Tickets:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong className={completedChar.accent}>Primary tickets</strong> count towards the department's total workload (first node assignments)</li>
            <li><strong className={infoChar.accent}>Secondary tickets</strong> measure teamwork effectiveness and employee criticality (subsequent nodes)</li>
            <li>Reassignments transfer credit to the new assignee</li>
            <li>Group leaders at first nodes get primary credit, members get secondary credit</li>
          </ul>
        </div>
      </div>

      {/* Primary Tickets Section */}
      <PrimarySecondarySection type="primary" data={analytics.primaryTickets} />

      {/* Secondary Tickets Section */}
      <PrimarySecondarySection type="secondary" data={analytics.secondaryTickets} />
    </div>
  );
}