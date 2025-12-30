// ===== app/components/appointments/AppointmentCard.tsx =====
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

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
  createdAt: Date;
}

interface AppointmentCardProps {
  appointment: Appointment;
  currentUsername: string;
  view: 'sent' | 'received';
  onViewDetails: (appointment: Appointment) => void;
}

export default function AppointmentCard({ appointment, currentUsername, view, onViewDetails }: AppointmentCardProps) {
  const { colors, cardCharacters } = useTheme();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          character: cardCharacters.interactive,
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          label: 'Pending Response'
        };
      case 'accepted':
        return {
          character: cardCharacters.completed,
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          label: 'Accepted'
        };
      case 'declined':
        return {
          character: cardCharacters.urgent,
          icon: <XCircle className="h-3.5 w-3.5" />,
          label: 'Declined'
        };
      case 'counter-proposed':
        return {
          character: cardCharacters.informative,
          icon: <RefreshCw className="h-3.5 w-3.5" />,
          label: 'Counter-Proposed'
        };
      default:
        return {
          character: cardCharacters.neutral,
          icon: <AlertCircle className="h-3.5 w-3.5" />,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(appointment.status);
  const cardChar = cardCharacters.neutral; // Base card uses neutral character
  
  // Check if this appointment was counter-proposed
  const wasCounterProposed = appointment.history.some(h => 
    h.action === 'counter-proposed' && h.details?.swappedRoles
  );
  
  const otherUser = view === 'sent' 
    ? appointment.requestedUsername 
    : appointment.requesterUsername;
  
  const isWaitingForMe = appointment.currentOwner === currentUsername;
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  return (
    <button
      onClick={() => onViewDetails(appointment)}
      className={`group relative w-full text-left overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardChar.bg} ${cardChar.border} ${colors.shadowCard} hover:${colors.shadowHover} transition-all duration-300 hover:scale-[1.02]`}
    >
      {/* Paper Texture */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      {/* Internal Glow on Hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
      ></div>

      <div className="relative p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-black ${cardChar.text} mb-1 line-clamp-1 group-hover:${cardChar.accent} transition-colors`}>
              {appointment.title}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <User className={`h-3 w-3 ${colors.textMuted}`} />
                <span className={`text-xs ${colors.textMuted}`}>
                  {view === 'sent' ? 'To:' : 'From:'}
                </span>
                <span className={`text-xs font-bold ${cardChar.accent}`}>
                  @{otherUser}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${statusConfig.character.bg} ${statusConfig.character.border}`}>
            <div className={statusConfig.character.iconColor}>
              {statusConfig.icon}
            </div>
            <span className={`text-[10px] font-bold ${statusConfig.character.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Counter-Proposal Notice */}
        {wasCounterProposed && (
          <div className={`flex items-center space-x-2 p-2 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
            <RefreshCw className={`h-3 w-3 ${cardCharacters.informative.iconColor}`} />
            <span className={`text-[10px] font-bold ${cardCharacters.informative.text}`}>
              REVISED REQUEST
            </span>
          </div>
        )}

        {/* Date and Time */}
        <div className={`p-2 rounded-lg border backdrop-blur-sm ${colors.inputBg} ${colors.inputBorder}`}>
          <div className={`flex items-center space-x-2 text-xs ${colors.textSecondary} mb-1`}>
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">{formatDate(appointment.proposedDate)}</span>
          </div>
          <div className={`flex items-center space-x-2 text-xs ${colors.textSecondary}`}>
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium">
              {formatTime(appointment.proposedStartTime)} - {formatTime(appointment.proposedEndTime)}
            </span>
          </div>
        </div>

        {/* Counter Proposal Reason */}
        {appointment.counterProposal?.reason && (
          <div className={`p-2 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
            <div className="flex items-center space-x-2 mb-1">
              <MessageSquare className={`h-3 w-3 ${cardCharacters.informative.iconColor}`} />
              <span className={`text-[10px] font-bold ${cardCharacters.informative.text}`}>Reason for Changes</span>
            </div>
            <p className={`text-xs ${colors.textMuted} line-clamp-2`}>
              {appointment.counterProposal.reason}
            </p>
          </div>
        )}

        {/* Decline Reason */}
        {appointment.status === 'declined' && appointment.declineReason && (
          <div className={`p-2 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
            <div className="flex items-center space-x-2 mb-1">
              <XCircle className={`h-3 w-3 ${cardCharacters.urgent.iconColor}`} />
              <span className={`text-[10px] font-bold ${cardCharacters.urgent.text}`}>Declined</span>
            </div>
            <p className={`text-xs ${colors.textMuted} line-clamp-2`}>
              {appointment.declineReason}
            </p>
          </div>
        )}

        {/* Description Preview */}
        {appointment.description && (
          <p className={`text-xs ${colors.textMuted} line-clamp-2`}>
            {appointment.description}
          </p>
        )}

        {/* Action Needed Badge */}
        {isWaitingForMe && appointment.status === 'pending' && (
          <div className={`flex items-center justify-between pt-3 border-t ${colors.border}`}>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: cardCharacters.urgent.iconColor.replace('text-', '') }}></div>
              <span className={`text-xs font-bold ${cardCharacters.urgent.text}`}>
                Response Required
              </span>
            </div>
            <span className={`text-[10px] ${colors.textMuted}`}>
              Click to view
            </span>
          </div>
        )}

        {/* Footer Info */}
        <div className={`flex items-center justify-between text-[10px] ${colors.textMuted} pt-2 border-t ${colors.borderSubtle}`}>
          <span>Created {new Date(appointment.createdAt).toLocaleDateString()}</span>
          {appointment.history.length > 1 && (
            <span>{appointment.history.length} updates</span>
          )}
        </div>
      </div>
    </button>
  );
}