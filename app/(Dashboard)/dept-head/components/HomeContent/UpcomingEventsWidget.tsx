// app/(Dashboard)/dept-head/components/HomeContent/UpcomingEventsWidget.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';
import { useTheme, useCardCharacter } from '@/app/context/ThemeContext';

interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  type?: string;
  color?: string;
  isAllDay?: boolean;
}

interface UpcomingEventsWidgetProps {
  onViewAll: () => void;
}

export default function UpcomingEventsWidget({ onViewAll }: UpcomingEventsWidgetProps) {
  const { colors, theme } = useTheme();
  const informativeChar = useCardCharacter('informative');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        console.log('❌ No user data in localStorage');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const userId = user.username;
      
      if (!userId) {
        console.error('❌ No user ID found in user object:', user);
        setLoading(false);
        return;
      }
      
      console.log('📅 === UPCOMING EVENTS FETCH START ===');
      console.log('👤 User ID:', userId);
      
      const now = new Date();
      
      // Get a range from today to 10 days in the future to ensure we capture everything
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10);

      console.log('📅 Date range:', {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      });

      const params = new URLSearchParams({
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const apiUrl = `/api/calendar?${params}`;
      console.log('🌐 API URL:', apiUrl);

      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Response:', data.events?.length || 0, 'total events');
        
        // Filter to upcoming events (after today) on the client side
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingEvents = (data.events || [])
          .filter((event: Event) => new Date(event.startDate) > today)
          .sort((a: Event, b: Event) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          .slice(0, 3);
        
        console.log('📊 Upcoming events to display:', upcomingEvents.length);
        setEvents(upcomingEvents);
      } else {
        console.error('❌ API request failed:', response.status);
      }
      
      console.log('📅 === UPCOMING EVENTS FETCH END ===');
    } catch (error) {
      console.error('💥 Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // Create date objects at midnight for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (eventDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (event: Event) => {
    if (event.isAllDay) {
      return 'All Day';
    }
    
    if (event.startTime && event.endTime) {
      return `${event.startTime} - ${event.endTime}`;
    }
    
    if (event.startTime) {
      return event.startTime;
    }
    
    // Fallback to date formatting
    const start = new Date(event.startDate);
    const timeStr = start.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    if (event.endDate) {
      const end = new Date(event.endDate);
      const endTimeStr = end.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return `${timeStr} - ${endTimeStr}`;
    }
    
    return timeStr;
  };

  const getTypeColor = (type?: string) => {
    if (theme === 'dark') {
      switch (type) {
        case 'task':
          return 'bg-blue-500/20 text-[#64B5F6]';
        case 'deadline':
          return 'bg-red-500/20 text-[#EF5350]';
        case 'meeting':
          return 'bg-purple-500/20 text-[#AB47BC]';
        case 'reminder':
          return 'bg-yellow-500/20 text-[#FFB74D]';
        default:
          return 'bg-gray-500/20 text-[#9E9E9E]';
      }
    } else {
      switch (type) {
        case 'task':
          return 'bg-blue-500/10 text-blue-600';
        case 'deadline':
          return 'bg-red-500/10 text-red-600';
        case 'meeting':
          return 'bg-purple-500/10 text-purple-600';
        case 'reminder':
          return 'bg-yellow-500/10 text-yellow-600';
        default:
          return 'bg-gray-500/10 text-gray-600';
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className={`w-8 h-8 border-2 ${colors.textAccent} border-t-transparent rounded-full animate-spin`}></div>
      </div>
    );
  }

  const accentColor = theme === 'dark' ? '#90CAF9' : '#42A5F5';

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className={`w-5 h-5 ${colors.textAccent}`} />
          <h3 className={`${colors.textPrimary} text-lg font-black`}>Upcoming Events</h3>
        </div>
        <button
          onClick={onViewAll}
          className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${informativeChar.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
        >
          {/* Paper Texture */}
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
          
          {/* Internal glow */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
          ></div>
          
          <span className={`text-xs font-bold relative z-10 ${informativeChar.accent}`}>View All</span>
          <ArrowRight className={`h-3.5 w-3.5 relative z-10 transition-transform duration-300 group-hover:translate-x-1 icon-rotate ${informativeChar.iconColor}`} />
        </button>
      </div>

      {/* Events List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {events.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <CalendarDays className={`w-12 h-12 ${colors.textMuted} mx-auto opacity-40`} />
            <p className={`${colors.textSecondary} text-sm font-semibold`}>No upcoming events</p>
            <p className={`${colors.textMuted} text-xs mt-1`}>You're all caught up!</p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event._id}
              className={`relative overflow-hidden p-3 rounded-lg bg-gradient-to-br ${colors.cardBg} border-2 ${colors.border} ${colors.borderHover} transition-all duration-200 cursor-pointer group ${colors.shadowCard}`}
            >
              {/* Paper Texture */}
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>

              {/* Hover Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>

              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span 
                      className="px-2 py-0.5 rounded-md text-xs font-bold"
                      style={{
                        backgroundColor: theme === 'dark' ? 'rgba(144, 202, 249, 0.2)' : 'rgba(66, 165, 245, 0.15)',
                        color: accentColor
                      }}
                    >
                      {formatDate(event.startDate)}
                    </span>
                    {event.type && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold capitalize ${getTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    )}
                  </div>
                  
                  <h4 className={`${colors.textPrimary} font-bold text-sm mb-1.5 truncate group-hover:${colors.textAccent} transition-colors`}>
                    {event.title}
                  </h4>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Clock className={`w-3.5 h-3.5 ${colors.textAccent}`} />
                      <span className={`${colors.textSecondary} text-xs font-semibold`}>
                        {formatTime(event)}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className={`${colors.textMuted} text-xs truncate`}>
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}