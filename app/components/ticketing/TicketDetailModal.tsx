// ============================================
// app/components/ticketing/TicketDetailModal.tsx
// View ticket details and take actions (for creators)
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Loader2, AlertCircle, CheckCircle, Clock, ArrowRight,
  FileText, User, Calendar, Tag, Activity, AlertTriangle
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Ticket {
  _id: string;
  ticketNumber: string;
  functionalityName: string;
  status: string;
  priority: string;
  workflowStage: string;
  formData: Record<string, any>;
  raisedBy: {
    userId: string;
    name: string;
    email: string;
  };
  workflowHistory: any[];
  blockers: any[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  ticketId: string;
  userId: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TicketDetailModal({ ticketId, userId, onClose, onUpdate }: Props) {
  const { colors, theme } = useTheme();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockerText, setBlockerText] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}`);
      
      if (!response.ok) throw new Error('Failed to fetch ticket');

      const data = await response.json();
      setTicket(data.ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const performAction = async (action: string, additionalData: any = {}) => {
    try {
      setActionLoading(true);
      
      const userData = localStorage.getItem('user');
      if (!userData) throw new Error('User not logged in');
      
      const user = JSON.parse(userData);

      const response = await fetch(`/api/tickets/${ticketId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          userId: user._id || user.id || user.userId || user.username,
          userName: user.basicDetails?.name || user.displayName || user.username,
          ...additionalData
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      await fetchTicket();
      setExplanation('');
      setBlockerText('');
      
      // Show success message
      alert('Action performed successfully!');
      
      if (['close_ticket', 'resolve_ticket'].includes(action)) {
        onUpdate();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveBlocker = () => {
    if (window.confirm('Are you sure you want to resolve this blocker?')) {
      performAction('resolve_blocker');
    }
  };

  const handleResolveTicket = () => {
    if (window.confirm('Are you sure you want to resolve this ticket? This will bypass the workflow.')) {
      performAction('resolve_ticket', { explanation });
    }
  };

  const handleCloseTicket = () => {
    if (window.confirm('Are you sure you want to close this ticket?')) {
      performAction('close_ticket');
    }
  };

  const handleReopenTicket = () => {
    const reason = prompt('Please provide a reason for reopening this ticket:');
    if (reason) {
      performAction('reopen_ticket', { explanation: reason });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFD700';
      case 'in-progress': return '#0000FF';
      case 'blocked': return '#FF0000';
      case 'resolved': return '#00FF00';
      case 'closed': return '#808080';
      default: return '#6495ED';
    }
  };

  const modalBg = theme === 'dark' ? '#0a0a1a' : '#ffffff';
  const modalBorder = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#0000FF] animate-spin" />
          <p className={colors.textPrimary}>Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div 
          className="max-w-md w-full rounded-2xl p-8"
          style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
        >
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className={`text-center ${colors.textPrimary} mb-4`}>{error || 'Ticket not found'}</p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-lg font-bold bg-gradient-to-r from-[#0000FF] to-[#6495ED] text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const isCreator = ticket.raisedBy.userId === userId;
  const hasUnresolvedBlockers = ticket.blockers?.some((b: any) => !b.isResolved) || false;
  const statusColor = getStatusColor(ticket.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ background: modalBg, border: `1px solid ${modalBorder}` }}
      >
        {/* Header */}
        <div 
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: modalBorder }}
        >
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <FileText className="w-6 h-6" style={{ color: statusColor }} />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${colors.textPrimary}`}>
                {ticket.ticketNumber}
              </h2>
              <p className={`text-sm ${colors.textSecondary}`}>
                {ticket.functionalityName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.textSecondary} hover:bg-red-500/20 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Continued in Part 2 */}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div 
                className="p-4 rounded-xl border"
                style={{ 
                  borderColor: modalBorder,
                  background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-bold ${colors.textPrimary}`}>Status</h3>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: `${statusColor}20`,
                      color: statusColor
                    }}
                  >
                    {ticket.status.toUpperCase().replace('-', ' ')}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className={colors.textMuted}>Priority</p>
                    <p className={`font-semibold ${colors.textPrimary} capitalize`}>
                      {ticket.priority}
                    </p>
                  </div>
                  <div>
                    <p className={colors.textMuted}>Created</p>
                    <p className={`font-semibold ${colors.textPrimary}`}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blockers */}
              {ticket.blockers && ticket.blockers.length > 0 && (
                <div 
                  className="p-4 rounded-xl border border-red-500/50"
                  style={{ background: 'rgba(255, 0, 0, 0.1)' }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-red-500">Blockers</h3>
                  </div>
                  <div className="space-y-3">
                    {ticket.blockers.map((blocker: any, idx: number) => (
                      <div 
                        key={idx}
                        className="p-3 rounded-lg"
                        style={{ 
                          background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
                          opacity: blocker.isResolved ? 0.5 : 1
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className={`text-sm ${colors.textPrimary}`}>
                            {blocker.description}
                          </p>
                          {blocker.isResolved && (
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-xs" style={{ color: colors.textMuted.replace('text-', '') }}>
                          Reported by {blocker.reportedByName} on{' '}
                          {new Date(blocker.reportedAt).toLocaleDateString()}
                        </p>
                        {blocker.isResolved && (
                          <p className="text-xs text-green-500 mt-1">
                            Resolved by {blocker.resolvedByName} on{' '}
                            {new Date(blocker.resolvedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {isCreator && hasUnresolvedBlockers && (
                    <button
                      onClick={handleResolveBlocker}
                      disabled={actionLoading}
                      className="mt-3 w-full py-2 rounded-lg font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? 'Resolving...' : 'Resolve Blocker'}
                    </button>
                  )}
                </div>
              )}

              {/* Workflow History */}
              <div>
                <h3 className={`font-bold ${colors.textPrimary} mb-3 flex items-center gap-2`}>
                  <Activity className="w-5 h-5" />
                  Workflow History
                </h3>
                <div className="space-y-3">
                  {ticket.workflowHistory && ticket.workflowHistory.length > 0 ? (
                    ticket.workflowHistory.map((action: any, idx: number) => (
                    <div 
                      key={idx}
                      className="flex gap-3"
                    >
                      <div className="flex flex-col items-center">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${statusColor}20` }}
                        >
                          <ArrowRight className="w-4 h-4" style={{ color: statusColor }} />
                        </div>
                        {idx < ticket.workflowHistory.length - 1 && (
                          <div 
                            className="w-0.5 flex-1 min-h-[20px]"
                            style={{ backgroundColor: modalBorder }}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`font-semibold ${colors.textPrimary} text-sm`}>
                          {action.actionType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </p>
                        <p className="text-xs" style={{ color: colors.textMuted.replace('text-', '') }}>
                          By {action.performedBy.name} •{' '}
                          {new Date(action.performedAt).toLocaleString()}
                        </p>
                        {action.explanation && (
                          <p className={`text-xs ${colors.textSecondary} mt-1 italic`}>
                            "{action.explanation}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                  ) : (
                    <div className={`p-4 rounded-lg text-center ${colors.textMuted}`}>
                      <p className="text-sm">No workflow actions yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form Data */}
            <div className="space-y-4">
              <h3 className={`font-bold ${colors.textPrimary} mb-3`}>Submitted Data</h3>
              <div className="space-y-3">
                {Object.entries(ticket.formData).map(([key, value]) => (
                  <div 
                    key={key}
                    className="p-3 rounded-lg"
                    style={{ 
                      background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                      border: `1px solid ${modalBorder}`
                    }}
                  >
                    <p className={`text-xs ${colors.textMuted} mb-1`}>
                      {key.replace('default-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </p>
                    <p className={`text-sm ${colors.textPrimary}`}>
                      {Array.isArray(value) ? (
                        value.length > 0 && typeof value[0] === 'object' ? (
                          <span className="text-xs">Table data ({value.length} rows)</span>
                        ) : (
                          value.join(', ')
                        )
                      ) : (
                        String(value)
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Actions (only for creator) */}
        {isCreator && (
          <div 
            className="p-6 border-t"
            style={{ borderColor: modalBorder }}
          >
            <div className="flex flex-wrap gap-3">
              {ticket.status === 'blocked' && hasUnresolvedBlockers && (
                <button
                  onClick={handleResolveBlocker}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                >
                  Resolve Blocker
                </button>
              )}
              
              {!['resolved', 'closed'].includes(ticket.status) && (
                <button
                  onClick={handleResolveTicket}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
                >
                  Resolve Ticket
                </button>
              )}
              
              {ticket.status === 'resolved' && (
                <button
                  onClick={handleCloseTicket}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-gray-500 hover:bg-gray-600 text-white transition-colors disabled:opacity-50"
                >
                  Close Ticket
                </button>
              )}
              
              {ticket.status === 'closed' && (
                <button
                  onClick={handleReopenTicket}
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-yellow-500 hover:bg-yellow-600 text-white transition-colors disabled:opacity-50"
                >
                  Reopen Ticket
                </button>
              )}
              
              <button
                onClick={onClose}
                className={`ml-auto px-6 py-2.5 rounded-lg font-semibold text-sm border ${colors.border} ${colors.textPrimary} transition-colors`}
                style={{
                  background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}