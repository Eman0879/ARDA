// ============================================
// app/components/ticketing/TicketDetailsView.tsx
// UPDATED WITH THEME CONTEXT
// ============================================

'use client';

import React from 'react';
import { 
  Info, Clock, User, AlertTriangle, CheckCircle, ArrowRight
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Ticket {
  _id: string;
  ticketNumber: string;
  functionalityName: string;
  status: string;
  workflowStage: string;
  currentAssignee: string;
  currentAssignees: string[];
  raisedBy: {
    name: string;
    userId: string;
  };
  formData?: Record<string, any>;
  workflowHistory: any[];
  blockers: any[];
  createdAt: string;
}

interface WorkflowPosition {
  isFirst: boolean;
  isLast: boolean;
  canForward: boolean;
  canRevert: boolean;
  nextNodeType: string | null;
  prevNodeType: string | null;
}

interface Props {
  ticket: Ticket;
  workflowPosition: WorkflowPosition;
}

export default function TicketDetailsView({ ticket, workflowPosition }: Props) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;

  return (
    <div className="space-y-4">
      {/* Ticket Info */}
      <div 
        className={`relative overflow-hidden p-4 rounded-xl border-2 bg-gradient-to-br ${charColors.bg} ${charColors.border}`}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative grid grid-cols-2 gap-4">
          <div>
            <p className={`text-xs ${colors.textMuted} mb-1 font-bold`}>Status</p>
            <p className={`font-semibold ${colors.textPrimary}`}>
              {ticket.status.toUpperCase().replace('-', ' ')}
            </p>
          </div>
          <div>
            <p className={`text-xs ${colors.textMuted} mb-1 font-bold`}>Raised By</p>
            <p className={`font-semibold ${colors.textPrimary}`}>
              {ticket.raisedBy.name}
            </p>
          </div>
          <div>
            <p className={`text-xs ${colors.textMuted} mb-1 font-bold`}>Workflow Stage</p>
            <p className={`font-semibold ${colors.textPrimary}`}>
              {workflowPosition.isFirst ? '🟢 First Stage' : workflowPosition.isLast ? '🔴 Final Stage' : '🟡 Middle Stage'}
            </p>
          </div>
          <div>
            <p className={`text-xs ${colors.textMuted} mb-1 font-bold`}>Assignees</p>
            <p className={`font-semibold ${colors.textPrimary}`}>
              {ticket.currentAssignees?.length || 1} {ticket.currentAssignees?.length > 1 ? 'people' : 'person'}
            </p>
          </div>
        </div>
      </div>

      {/* Form Data Display */}
      {ticket.formData && Object.keys(ticket.formData).length > 0 && (
        <div>
          <h3 className={`font-bold ${colors.textPrimary} mb-3 flex items-center gap-2`}>
            <Info className={`w-5 h-5 ${charColors.iconColor}`} />
            Submitted Information
          </h3>
          <div 
            className={`relative overflow-hidden p-4 rounded-xl space-y-3 max-h-96 overflow-y-auto border-2 ${colors.inputBg} ${colors.inputBorder}`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            <div className="relative space-y-3">
              {Object.entries(ticket.formData).map(([key, value]) => {
                const label = key
                  .replace('default-', '')
                  .replace(/-/g, ' ')
                  .replace(/field-\d+/, 'Custom Field')
                  .replace(/\b\w/g, (l: string) => l.toUpperCase());
                
                let displayValue: React.ReactNode;
                
                if (Array.isArray(value)) {
                  if (value.length === 0) {
                    displayValue = <span className={colors.textMuted}>Not provided</span>;
                  } else if (typeof value[0] === 'object') {
                    // Table data
                    displayValue = (
                      <div className="overflow-x-auto mt-2">
                        <table className={`w-full text-sm border-collapse border-2 ${colors.inputBorder}`}>
                          <thead>
                            <tr className={colors.inputBg}>
                              {Object.keys(value[0]).map((col) => (
                                <th 
                                  key={col}
                                  className={`px-2 py-1 text-left text-xs font-bold ${colors.textPrimary} border ${colors.borderSubtle}`}
                                >
                                  {col.replace(/col\d+/, 'Column').toUpperCase()}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {value.map((row: any, idx: number) => (
                              <tr key={idx}>
                                {Object.values(row).map((cell: any, cellIdx: number) => (
                                  <td 
                                    key={cellIdx}
                                    className={`px-2 py-1 text-xs border ${colors.textPrimary} ${colors.borderSubtle}`}
                                  >
                                    {cell || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  } else {
                    displayValue = (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {value.map((item: any, idx: number) => (
                          <span 
                            key={idx}
                            className={`px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r ${charColors.bg} ${charColors.text}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    );
                  }
                } else if (typeof value === 'object' && value !== null) {
                  displayValue = JSON.stringify(value);
                } else if (!value) {
                  displayValue = <span className={colors.textMuted}>Not provided</span>;
                } else {
                  displayValue = String(value);
                }

                return (
                  <div key={key} className={`pb-3 border-b last:border-b-0 ${colors.borderSubtle}`}>
                    <p className={`text-xs font-bold ${colors.textMuted} mb-1 uppercase`}>
                      {label}
                    </p>
                    <div className={`text-sm ${colors.textPrimary}`}>
                      {displayValue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Blockers */}
      {ticket.blockers && ticket.blockers.length > 0 && (
        <div>
          <h3 className={`font-bold ${colors.textPrimary} mb-3 flex items-center gap-2`}>
            <AlertTriangle className={`w-5 h-5 ${cardCharacters.urgent.iconColor}`} />
            Blockers
          </h3>
          <div className="space-y-2">
            {ticket.blockers.map((blocker: any, index: number) => (
              <div 
                key={index}
                className={`relative overflow-hidden p-3 rounded-lg border-2 ${
                  blocker.isResolved 
                    ? `bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border}`
                    : `bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`
                }`}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                <div className="relative">
                  <p className={`text-sm ${colors.textPrimary} mb-1 font-medium`}>
                    {blocker.description}
                  </p>
                  <p className={`text-xs ${colors.textMuted}`}>
                    Reported by {blocker.reportedByName} • {new Date(blocker.reportedAt).toLocaleDateString()}
                  </p>
                  {blocker.isResolved && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${cardCharacters.completed.text}`}>
                      <CheckCircle className="w-3 h-3" />
                      Resolved by {blocker.resolvedByName}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow History */}
      {ticket.workflowHistory && ticket.workflowHistory.length > 0 && (
        <div>
          <h3 className={`font-bold ${colors.textPrimary} mb-3 flex items-center gap-2`}>
            <Clock className={`w-5 h-5 ${charColors.iconColor}`} />
            Workflow History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ticket.workflowHistory.slice().reverse().map((entry: any, index: number) => (
              <div 
                key={index}
                className={`relative overflow-hidden p-3 rounded-lg border-2 ${colors.inputBg} ${colors.inputBorder}`}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${colors.textPrimary} flex items-center gap-2`}>
                      <ArrowRight className="w-3 h-3" />
                      {entry.actionType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    {entry.explanation && (
                      <p className={`text-xs ${colors.textSecondary} mt-1 ml-5 italic`}>
                        {entry.explanation}
                      </p>
                    )}
                    <p className={`text-xs ${colors.textMuted} mt-1 ml-5 flex items-center gap-1`}>
                      <User className="w-3 h-3" />
                      {entry.performedBy?.name} • {new Date(entry.performedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}