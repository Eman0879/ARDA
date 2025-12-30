// ===== app/components/appointments/AppointmentInvitation.tsx =====
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { X, CheckCircle, XCircle, Clock, Calendar, User, FileText, History as HistoryIcon, RefreshCw, MessageSquare } from 'lucide-react';

interface Appointment {
  _id: string;
  requesterUsername: string;
  requestedUsername: string;
  title: string;
  description?: string;
  proposedDate: Date;
  proposedStartTime: string;
  proposedEndTime: string;
  status: 'pending' | 'accepted' | 'declined' | 'counter-proposed';
  currentOwner: string;
  counterProposal?: {
    date: Date;
    startTime: string;
    endTime: string;
    reason: string;
  };
  declineReason?: string;
  history: Array<{
    action: string;
    by: string;
    timestamp: Date;
    details?: any;
  }>;
}

interface AppointmentInvitationProps {
  appointment: Appointment;
  currentUsername: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AppointmentInvitation({ appointment, currentUsername, onClose, onSuccess }: AppointmentInvitationProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [action, setAction] = useState<'accept' | 'decline' | 'counter' | null>(null);
  const [loading, setLoading] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [counterProposal, setCounterProposal] = useState({
    date: new Date(appointment.proposedDate).toISOString().split('T')[0],
    startTime: appointment.proposedStartTime,
    endTime: appointment.proposedEndTime,
    reason: ''
  });

  const canRespond = appointment.currentOwner === currentUsername && appointment.status === 'pending';
  const isRequester = appointment.requesterUsername === currentUsername;

  const handleResponse = async () => {
    if (!action) return;

    try {
      setLoading(true);

      const body: any = {
        username: currentUsername
      };

      if (action === 'decline') {
        body.action = 'decline';
        body.reason = declineReason;
      } else if (action === 'counter') {
        body.action = 'counter-propose';
        body.counterProposal = counterProposal;
      } else if (action === 'accept') {
        body.action = 'accept';
      }

      const response = await fetch(`/api/appointments/${appointment._id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to respond to appointment');
      }
    } catch (error) {
      console.error('Failed to respond:', error);
      alert('Failed to respond to appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const otherUser = appointment.requesterUsername === currentUsername 
    ? appointment.requestedUsername 
    : appointment.requesterUsername;

  const wasCounterProposed = appointment.history.some(h => 
    h.action === 'counter-proposed' && h.details?.swappedRoles
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className={`relative overflow-hidden rounded-xl border backdrop-blur-md ${colors.border} shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto`}
        style={{
          background: `linear-gradient(to bottom right, ${colors.cardBg.replace('from-', '').replace('to-', ',')})`,
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.scrollbarThumb} ${colors.scrollbarTrack}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>

        {/* Header */}
        <div className={`sticky top-0 z-10 backdrop-blur-md border-b ${colors.border} p-4`}
             style={{
               background: `linear-gradient(to bottom right, ${colors.cardBg.replace('from-', '').replace('to-', ',')})`
             }}>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <Calendar className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h2 className={`text-lg font-black ${charColors.text}`}>
                  Appointment {canRespond ? 'Request' : 'Details'}
                </h2>
                <p className={`text-xs ${colors.textMuted}`}>
                  {canRespond ? 'Review and respond' : 'Appointment information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`group relative p-2 rounded-lg transition-all duration-300 overflow-hidden ${colors.inputBg} border ${colors.inputBorder} hover:${colors.borderHover}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
              ></div>
              <X className={`h-5 w-5 relative z-10 ${colors.textMuted} group-hover:${cardCharacters.urgent.iconColor}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Counter-Proposal Notice */}
          {wasCounterProposed && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw className={`h-5 w-5 ${cardCharacters.informative.iconColor}`} />
                <h4 className={`text-sm font-black ${cardCharacters.informative.text}`}>Counter-Proposal Request</h4>
              </div>
              <p className={`text-sm ${colors.textSecondary}`}>
                {isRequester 
                  ? `You proposed changes. Waiting for @${otherUser}'s response.`
                  : `@${otherUser} proposed changes. Please review and respond.`
                }
              </p>
            </div>
          )}

          {/* Appointment Info */}
          <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border} space-y-4`}>
            <div>
              <h3 className={`text-xl font-black ${colors.textPrimary} mb-2`}>
                {appointment.title}
              </h3>
              {appointment.description && (
                <p className={`text-sm ${colors.textSecondary}`}>
                  {appointment.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border backdrop-blur-sm ${colors.inputBg} ${colors.inputBorder}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <User className={`h-4 w-4 ${colors.textMuted}`} />
                  <span className={`text-xs font-bold ${colors.textSecondary}`}>
                    {isRequester ? 'Meeting With' : 'Requested By'}
                  </span>
                </div>
                <p className={`text-sm font-bold ${colors.textPrimary}`}>@{otherUser}</p>
              </div>

              <div className={`p-3 rounded-lg border backdrop-blur-sm ${colors.inputBg} ${colors.inputBorder}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className={`h-4 w-4 ${colors.textMuted}`} />
                  <span className={`text-xs font-bold ${colors.textSecondary}`}>Date</span>
                </div>
                <p className={`text-sm font-bold ${colors.textPrimary}`}>
                  {formatDate(appointment.proposedDate)}
                </p>
              </div>

              <div className={`p-3 rounded-lg border backdrop-blur-sm ${colors.inputBg} ${colors.inputBorder}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className={`h-4 w-4 ${colors.textMuted}`} />
                  <span className={`text-xs font-bold ${colors.textSecondary}`}>Time</span>
                </div>
                <p className={`text-sm font-bold ${colors.textPrimary}`}>
                  {formatTime(appointment.proposedStartTime)} - {formatTime(appointment.proposedEndTime)}
                </p>
              </div>

              <div className={`p-3 rounded-lg border backdrop-blur-sm ${colors.inputBg} ${colors.inputBorder}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className={`h-4 w-4 ${colors.textMuted}`} />
                  <span className={`text-xs font-bold ${colors.textSecondary}`}>Status</span>
                </div>
                <p className={`text-sm font-bold capitalize ${colors.textPrimary}`}>
                  {appointment.status.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Counter Proposal Reason */}
          {appointment.counterProposal?.reason && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className={`h-4 w-4 ${cardCharacters.informative.iconColor}`} />
                <h4 className={`text-sm font-black ${cardCharacters.informative.text}`}>Reason for Changes</h4>
              </div>
              <p className={`text-sm ${colors.textSecondary}`}>
                {appointment.counterProposal.reason}
              </p>
            </div>
          )}

          {/* Decline Reason */}
          {appointment.status === 'declined' && appointment.declineReason && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className={`h-4 w-4 ${cardCharacters.urgent.iconColor}`} />
                <h4 className={`text-sm font-black ${cardCharacters.urgent.text}`}>Declined</h4>
              </div>
              <p className={`text-sm ${colors.textSecondary}`}>
                {appointment.declineReason}
              </p>
            </div>
          )}

          {/* History */}
          {appointment.history.length > 0 && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
              <h4 className={`text-sm font-black ${colors.textPrimary} mb-3 flex items-center space-x-2`}>
                <HistoryIcon className="h-4 w-4" />
                <span>History</span>
              </h4>
              <div className="space-y-2">
                {appointment.history.map((item, index) => (
                  <div key={index} className={`p-2 rounded-lg border backdrop-blur-sm ${colors.inputBg} ${colors.inputBorder}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${colors.textPrimary} capitalize`}>
                        {item.action.replace('-', ' ')}
                        {item.details?.swappedRoles && ' (Roles Swapped)'}
                      </span>
                      <span className={`text-xs ${colors.textMuted}`}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-xs ${colors.textMuted}`}>
                      by @{item.by}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response Actions */}
          {canRespond && !action && (
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setAction('accept')}
                className={`group relative flex flex-col items-center space-y-2 p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border} hover:scale-105 transition-all duration-300 overflow-hidden`}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 20px ${colors.glowSuccess}` }}
                ></div>
                <CheckCircle className={`h-6 w-6 relative z-10 ${cardCharacters.completed.iconColor}`} />
                <span className={`text-sm font-bold relative z-10 ${cardCharacters.completed.text}`}>Accept</span>
              </button>

              <button
                onClick={() => setAction('counter')}
                className={`group relative flex flex-col items-center space-y-2 p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} hover:scale-105 transition-all duration-300 overflow-hidden`}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
                ></div>
                <RefreshCw className={`h-6 w-6 relative z-10 ${cardCharacters.informative.iconColor}`} />
                <span className={`text-sm font-bold relative z-10 ${cardCharacters.informative.text}`}>Propose Changes</span>
              </button>

              <button
                onClick={() => setAction('decline')}
                className={`group relative flex flex-col items-center space-y-2 p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} hover:scale-105 transition-all duration-300 overflow-hidden`}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 20px ${colors.glowWarning}` }}
                ></div>
                <XCircle className={`h-6 w-6 relative z-10 ${cardCharacters.urgent.iconColor}`} />
                <span className={`text-sm font-bold relative z-10 ${cardCharacters.urgent.text}`}>Decline</span>
              </button>
            </div>
          )}

          {/* Decline Form */}
          {action === 'decline' && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} space-y-3`}>
              <h4 className={`text-sm font-black ${cardCharacters.urgent.text}`}>Decline Appointment</h4>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none transition-all resize-none`}
                rows={3}
                placeholder="Please provide a reason for declining..."
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAction(null)}
                  className={`flex-1 px-4 py-2 border ${colors.border} rounded-lg font-bold ${colors.textSecondary} hover:${colors.textPrimary} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponse}
                  disabled={loading || !declineReason.trim()}
                  className={`group relative flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-300 overflow-hidden bg-gradient-to-r ${cardCharacters.urgent.bg} border ${cardCharacters.urgent.border} ${cardCharacters.urgent.text} disabled:opacity-50`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowWarning}` }}
                  ></div>
                  <span className="relative z-10">{loading ? 'Declining...' : 'Confirm Decline'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Counter Proposal Form */}
          {action === 'counter' && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} space-y-3`}>
              <h4 className={`text-sm font-black ${cardCharacters.informative.text}`}>Propose Changes</h4>
              <p className={`text-xs ${colors.textMuted}`}>
                Suggest a different time or date. The request will be sent back to @{otherUser}.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-1`}>Date</label>
                  <input
                    type="date"
                    value={counterProposal.date}
                    onChange={(e) => setCounterProposal({ ...counterProposal, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-2 py-1.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-1`}>Start Time</label>
                  <input
                    type="time"
                    value={counterProposal.startTime}
                    onChange={(e) => setCounterProposal({ ...counterProposal, startTime: e.target.value })}
                    className={`w-full px-2 py-1.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-1`}>End Time</label>
                  <input
                    type="time"
                    value={counterProposal.endTime}
                    onChange={(e) => setCounterProposal({ ...counterProposal, endTime: e.target.value })}
                    className={`w-full px-2 py-1.5 ${colors.inputBg} border ${colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none`}
                  />
                </div>
              </div>

              <textarea
                value={counterProposal.reason}
                onChange={(e) => setCounterProposal({ ...counterProposal, reason: e.target.value })}
                className={`w-full px-3 py-2 ${colors.inputBg} border ${colors.inputBorder} rounded-lg text-sm ${colors.inputText} focus:outline-none transition-all resize-none`}
                rows={2}
                placeholder="Explain why you're proposing these changes..."
                required
              />

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAction(null)}
                  className={`flex-1 px-4 py-2 border ${colors.border} rounded-lg font-bold ${colors.textSecondary} hover:${colors.textPrimary} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponse}
                  disabled={loading || !counterProposal.reason.trim()}
                  className={`group relative flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                  ></div>
                  <span className="relative z-10">{loading ? 'Sending...' : 'Send Changes'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Accept Confirmation */}
          {action === 'accept' && (
            <div className={`p-4 rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border} space-y-3`}>
              <h4 className={`text-sm font-black ${cardCharacters.completed.text}`}>Accept Appointment</h4>
              <p className={`text-sm ${colors.textSecondary}`}>
                This appointment will be added to both calendars. Confirm acceptance?
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAction(null)}
                  className={`flex-1 px-4 py-2 border ${colors.border} rounded-lg font-bold ${colors.textSecondary} hover:${colors.textPrimary} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleResponse}
                  disabled={loading}
                  className={`group relative flex-1 px-4 py-2 rounded-lg font-bold transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowSuccess}, inset 0 0 28px ${colors.glowSuccess}` }}
                  ></div>
                  <span className="relative z-10">{loading ? 'Accepting...' : 'Confirm Accept'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}