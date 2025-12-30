// ===== app/components/appointments/AppointmentList.tsx =====
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Calendar, Plus, ArrowLeft, RefreshCw, Filter } from 'lucide-react';
import AppointmentCard from './AppointmentCard';
import AppointmentRequest from './AppointmentRequest';
import AppointmentInvitation from './AppointmentInvitation';

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

type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined';

interface AppointmentListProps {
  onBack?: () => void;
}

export default function AppointmentList({ onBack }: AppointmentListProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      
      const response = await fetch(`/api/appointments?username=${user.username}&view=all`);
      const data = await response.json();

      if (data.success) {
        const formatted = data.appointments.map((apt: any) => ({
          ...apt,
          proposedDate: new Date(apt.proposedDate),
          counterProposal: apt.counterProposal ? {
            ...apt.counterProposal,
            date: new Date(apt.counterProposal.date)
          } : undefined
        }));

        setAppointments(formatted);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  // Categorize appointments
  const categorizeAppointments = () => {
    const userData = localStorage.getItem('user');
    if (!userData) return { needResponse: [], waitingResponse: [], upcoming: [], past: [] };
    
    const user = JSON.parse(userData);
    const now = new Date();

    const needResponse = appointments.filter(apt => 
      apt.currentOwner === user.username && 
      apt.status === 'pending'
    );

    const waitingResponse = appointments.filter(apt => 
      apt.currentOwner !== user.username && 
      apt.status === 'pending'
    );

    const upcoming = appointments.filter(apt => {
      if (apt.status !== 'accepted') return false;
      const appointmentDate = new Date(apt.proposedDate);
      const [hours, minutes] = apt.proposedEndTime.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return appointmentDate >= now;
    });

    const past = appointments.filter(apt => {
      if (apt.status === 'declined') return true;
      if (apt.status === 'accepted') {
        const appointmentDate = new Date(apt.proposedDate);
        const [hours, minutes] = apt.proposedEndTime.split(':');
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        return appointmentDate < now;
      }
      return false;
    });

    return { needResponse, waitingResponse, upcoming, past };
  };

  const filterByStatus = (apts: Appointment[]) => {
    if (statusFilter === 'all') return apts;
    return apts.filter(apt => apt.status === statusFilter);
  };

  const { needResponse, waitingResponse, upcoming, past } = categorizeAppointments();

  const userData = localStorage.getItem('user');
  const currentUsername = userData ? JSON.parse(userData).username : '';

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">
      {/* Header with Back Button and Filters */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300`}>
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
              >
                {/* Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                
                {/* Internal Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                ></div>
                
                <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
              </button>

              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <Calendar className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h1 className={`text-xl font-black ${charColors.text}`}>Appointments</h1>
                <p className={`text-xs ${colors.textMuted}`}>Manage your meetings and invitations</p>
              </div>
            </div>
            
            {/* New Request Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <Plus className="h-4 w-4 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
              <span className="text-sm font-bold relative z-10">New Request</span>
            </button>
          </div>

          {/* Always Visible Filters */}
          <div className={`p-3 rounded-lg border ${charColors.border} bg-gradient-to-br ${colors.cardBg} backdrop-blur-sm`}>
            <div className="flex items-center space-x-2 mb-2">
              <Filter className={`h-4 w-4 ${colors.textMuted}`} />
              <span className={`text-xs font-bold ${colors.textSecondary}`}>Filter by status:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'accepted', 'declined'] as StatusFilter[]).map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                    statusFilter === status
                      ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                      : `${colors.inputBg} ${colors.textSecondary} hover:${colors.textPrimary}`
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} p-12 ${colors.shadowCard}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className={`w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto`} style={{ borderColor: charColors.iconColor.replace('text-', '') }}></div>
              <p className={`${colors.textMuted} text-sm`}>Loading appointments...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Action Required Section */}
          {needResponse.length > 0 && (
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} ${colors.shadowCard} transition-all duration-300`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <h2 className={`text-lg font-black ${cardCharacters.urgent.text}`}>
                      Action Required ({needResponse.length})
                    </h2>
                  </div>
                  <RefreshCw 
                    onClick={fetchAppointments}
                    className={`h-4 w-4 cursor-pointer transition-transform hover:rotate-180 ${cardCharacters.urgent.iconColor}`} 
                  />
                </div>
                <p className={`text-xs ${colors.textMuted} mb-4`}>
                  These appointments are waiting for your response
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(needResponse).map(appointment => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      currentUsername={currentUsername}
                      view="received"
                      onViewDetails={setSelectedAppointment}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Response Section */}
          {waitingResponse.length > 0 && (
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.interactive.bg} ${cardCharacters.interactive.border} ${colors.shadowCard} transition-all duration-300`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-black ${cardCharacters.interactive.text}`}>
                    Waiting for Response ({waitingResponse.length})
                  </h2>
                  <RefreshCw 
                    onClick={fetchAppointments}
                    className={`h-4 w-4 cursor-pointer transition-transform hover:rotate-180 ${cardCharacters.interactive.iconColor}`} 
                  />
                </div>
                <p className={`text-xs ${colors.textMuted} mb-4`}>
                  Appointments you sent that are awaiting response
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(waitingResponse).map(appointment => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      currentUsername={currentUsername}
                      view="sent"
                      onViewDetails={setSelectedAppointment}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcoming.length > 0 && (
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border} ${colors.shadowCard} transition-all duration-300`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-black ${cardCharacters.completed.text}`}>
                    Upcoming Meetings ({upcoming.length})
                  </h2>
                  <RefreshCw 
                    onClick={fetchAppointments}
                    className={`h-4 w-4 cursor-pointer transition-transform hover:rotate-180 ${cardCharacters.completed.iconColor}`} 
                  />
                </div>
                <p className={`text-xs ${colors.textMuted} mb-4`}>
                  Confirmed appointments scheduled for the future
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(upcoming).map(appointment => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      currentUsername={currentUsername}
                      view="sent"
                      onViewDetails={setSelectedAppointment}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Past Section */}
          {past.length > 0 && (
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.neutral.bg} ${cardCharacters.neutral.border} ${colors.shadowCard} transition-all duration-300`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-black ${cardCharacters.neutral.text}`}>
                    History ({past.length})
                  </h2>
                  <RefreshCw 
                    onClick={fetchAppointments}
                    className={`h-4 w-4 cursor-pointer transition-transform hover:rotate-180 ${cardCharacters.neutral.iconColor}`} 
                  />
                </div>
                <p className={`text-xs ${colors.textMuted} mb-4`}>
                  Past and declined appointments
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterByStatus(past).map(appointment => (
                    <AppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      currentUsername={currentUsername}
                      view="sent"
                      onViewDetails={setSelectedAppointment}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {appointments.length === 0 && (
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} p-12 ${colors.shadowCard} text-center`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative">
                <div className={`p-4 bg-gradient-to-r ${charColors.bg} rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                  <Calendar className={`h-8 w-8 ${charColors.iconColor}`} />
                </div>
                <h3 className={`text-lg font-black ${charColors.text} mb-2`}>
                  No Appointments Yet
                </h3>
                <p className={`text-sm ${colors.textMuted} mb-4`}>
                  Start by creating your first appointment request
                </p>
                <button
                  onClick={() => setShowRequestModal(true)}
                  className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent ${colors.shadowCard} hover:${colors.shadowHover}`}
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-bold">Create Request</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Request Modal */}
      {showRequestModal && (
        <AppointmentRequest
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchAppointments}
        />
      )}

      {/* Invitation/Details Modal */}
      {selectedAppointment && (
        <AppointmentInvitation
          appointment={selectedAppointment}
          currentUsername={currentUsername}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
}