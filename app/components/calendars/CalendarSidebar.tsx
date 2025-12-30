'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { ChevronLeft, ChevronRight, Circle, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

interface CalendarEvent {
  _id: string;
  title: string;
  type: string;
  startDate: Date;
  startTime?: string;
  color: string;
  completed: boolean;
}

interface CalendarSidebarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateChange: (date: Date) => void;
}

export default function CalendarSidebar({ currentDate, events, onEventClick, onDateChange }: CalendarSidebarProps) {
  const { colors, cardCharacters, theme } = useTheme();
  const charColors = cardCharacters.informative;
  const interactiveColors = cardCharacters.interactive;
  
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      task: 'Task',
      deadline: 'Deadline',
      meeting: 'Meeting',
      reminder: 'Reminder'
    };
    return labels[type] || type;
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === today.getFullYear() &&
             eventDate.getMonth() === today.getMonth() &&
             eventDate.getDate() === today.getDate();
    }).sort((a, b) => {
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return events
      .filter(event => new Date(event.startDate) > today)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 5);
  };

  const todayEvents = getTodayEvents();
  const upcomingEvents = getUpcomingEvents();

  const getDaysInMonth = () => {
    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, new Date(year, month, 0).getDate() - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const hasEvents = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getFullYear() === date.getFullYear() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getDate() === date.getDate();
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setMiniCalendarDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setMiniCalendarDate(newDate);
  };

  const getEventColor = (event: CalendarEvent) => {
    const typeColors: Record<string, string> = {
      task: theme === 'dark' ? '#64B5F6' : '#2196F3',
      deadline: theme === 'dark' ? '#FFB74D' : '#FF9800',
      meeting: theme === 'dark' ? '#A1887F' : '#8D6E63',
      reminder: theme === 'dark' ? '#81C784' : '#4CAF50'
    };
    return event.color || typeColors[event.type] || (theme === 'dark' ? '#64B5F6' : '#2196F3');
  };

  return (
    <div className="space-y-6 sticky top-6">
      {/* Mini Calendar */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-5">
          {/* Mini Calendar Header */}
          <div className="flex items-center justify-between mb-5">
            <button 
              onClick={handlePrevMonth}
              className={`group relative p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 overflow-hidden ${colors.inputBg} ${colors.inputBorder}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 12px ${colors.glowPrimary}` }}
              ></div>
              <ChevronLeft className={`h-4 w-4 ${colors.textSecondary} relative z-10 group-hover:translate-x-[-2px] transition-transform duration-300`} />
            </button>
            
            <div className={`px-4 py-2 rounded-xl border font-bold text-sm flex items-center gap-2 bg-gradient-to-r ${charColors.bg} ${charColors.border}`}>
              <CalendarIcon className={`h-4 w-4 ${charColors.iconColor}`} />
              {miniCalendarDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
            
            <button 
              onClick={handleNextMonth}
              className={`group relative p-2.5 rounded-xl border transition-all duration-300 hover:scale-110 overflow-hidden ${colors.inputBg} ${colors.inputBorder}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 12px ${colors.glowPrimary}` }}
              ></div>
              <ChevronRight className={`h-4 w-4 ${colors.textSecondary} relative z-10 group-hover:translate-x-[2px] transition-transform duration-300`} />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className={`text-[10px] font-black uppercase tracking-wider ${colors.textMuted} py-1.5`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {getDaysInMonth().map((day, index) => {
              const hasEvent = hasEvents(day.date);
              const isCurrentDay = isToday(day.date);
              
              return (
                <button
                  key={index}
                  onClick={() => onDateChange(day.date)}
                  className={`group/day relative aspect-square text-xs rounded-lg transition-all duration-300 hover:scale-110 ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                >
                  <div className={`absolute inset-0.5 rounded-lg transition-all duration-300 ${
                    isCurrentDay 
                      ? `bg-gradient-to-br ${charColors.bg} shadow-md` 
                      : hasEvent && day.isCurrentMonth
                      ? colors.inputBg
                      : colors.inputBg
                  }`}></div>
                  
                  <div className={`absolute inset-0 rounded-lg border transition-all duration-300 ${
                    isCurrentDay 
                      ? charColors.border 
                      : hasEvent && day.isCurrentMonth
                      ? colors.inputBorder
                      : colors.borderSubtle
                  }`}></div>
                  
                  {day.isCurrentMonth && (
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/day:opacity-100 transition-opacity duration-500 rounded-lg"
                      style={{ boxShadow: `inset 0 0 8px ${colors.glowPrimary}` }}
                    ></div>
                  )}
                  
                  <span className={`relative z-10 font-semibold ${isCurrentDay ? charColors.text : day.isCurrentMonth ? colors.textPrimary : colors.textMuted}`}>
                    {day.date.getDate()}
                  </span>
                  
                  {hasEvent && day.isCurrentMonth && (
                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2">
                      <div className={`h-1.5 w-1.5 rounded-full ${isCurrentDay ? charColors.iconColor : interactiveColors.iconColor}`}></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Events */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${interactiveColors.bg} ${interactiveColors.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className={`text-sm font-black ${interactiveColors.text} flex items-center gap-2`}>
              <Clock className={`h-4 w-4 ${interactiveColors.iconColor}`} />
              Today's Events
            </h3>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              todayEvents.length > 0 
                ? `bg-gradient-to-r ${interactiveColors.bg} border ${interactiveColors.border}` 
                : `${colors.inputBg} border ${colors.borderSubtle}`
            } ${todayEvents.length > 0 ? interactiveColors.text : colors.textMuted}`}>
              {todayEvents.length}
            </span>
          </div>
          
          {todayEvents.length === 0 ? (
            <div className={`text-center py-8 rounded-xl border ${colors.borderSubtle} ${colors.inputBg}`}>
              <CheckCircle2 className={`h-10 w-10 ${colors.textMuted} mx-auto mb-3 opacity-50`} />
              <p className={`text-sm font-semibold ${colors.textMuted}`}>All caught up!</p>
              <p className={`text-xs ${colors.textMuted} opacity-70 mt-1`}>No events today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEvents.map(event => {
                const eventColor = getEventColor(event);
                return (
                  <button
                    key={event._id}
                    onClick={() => onEventClick(event)}
                    className="group/event w-full text-left transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm p-3.5 ${event.completed ? 'opacity-60' : 'opacity-100'} transition-all duration-300 ${colors.inputBg} ${colors.inputBorder}`}>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover/event:opacity-100 transition-opacity duration-500"
                        style={{ boxShadow: `inset 0 0 20px ${eventColor}30` }}
                      ></div>
                      
                      <div className="relative">
                        <div className="flex items-start gap-3 mb-2">
                          <Circle className={`h-3.5 w-3.5 flex-shrink-0 mt-1 ${event.completed ? 'text-green-500' : ''}`} style={{ color: eventColor }} />
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold ${colors.textPrimary} truncate ${event.completed ? 'line-through opacity-60' : ''}`}>
                              {event.title}
                            </h4>
                            <p className={`text-[11px] ${colors.textMuted} mt-0.5`}>
                              {getEventTypeLabel(event.type)}
                            </p>
                          </div>
                        </div>
                        
                        {event.startTime && (
                          <div className={`flex items-center gap-1.5 text-[11px] ${colors.textMuted} mt-2.5`}>
                            <Clock className="h-3 w-3" />
                            <span className="font-semibold">{event.startTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.creative.bg} ${cardCharacters.creative.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className={`text-sm font-black ${cardCharacters.creative.text} flex items-center gap-2`}>
              <CalendarIcon className={`h-4 w-4 ${cardCharacters.creative.iconColor}`} />
              Upcoming
            </h3>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
              upcomingEvents.length > 0 
                ? `bg-gradient-to-r ${cardCharacters.creative.bg} border ${cardCharacters.creative.border}` 
                : `${colors.inputBg} border ${colors.borderSubtle}`
            } ${upcomingEvents.length > 0 ? cardCharacters.creative.text : colors.textMuted}`}>
              {upcomingEvents.length}
            </span>
          </div>
          
          {upcomingEvents.length === 0 ? (
            <div className={`text-center py-8 rounded-xl border ${colors.borderSubtle} ${colors.inputBg}`}>
              <CalendarIcon className={`h-10 w-10 ${colors.textMuted} mx-auto mb-3 opacity-50`} />
              <p className={`text-sm font-semibold ${colors.textMuted}`}>Nothing upcoming</p>
              <p className={`text-xs ${colors.textMuted} opacity-70 mt-1`}>Plan ahead</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const eventColor = getEventColor(event);
                const eventDate = new Date(event.startDate);
                const today = new Date();
                const isTomorrow = eventDate.getDate() === today.getDate() + 1 && 
                                  eventDate.getMonth() === today.getMonth() &&
                                  eventDate.getFullYear() === today.getFullYear();
                
                return (
                  <button
                    key={event._id}
                    onClick={() => onEventClick(event)}
                    className="group/event w-full text-left transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm p-3.5 transition-all duration-300 ${colors.inputBg} ${colors.inputBorder}`}>
                      <div 
                        className="absolute inset-0 opacity-0 group-hover/event:opacity-100 transition-opacity duration-500"
                        style={{ boxShadow: `inset 0 0 20px ${eventColor}30` }}
                      ></div>
                      
                      <div className="relative">
                        <div className="flex items-start gap-3 mb-2">
                          <Circle className="h-3.5 w-3.5 flex-shrink-0 mt-1" style={{ color: eventColor }} />
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold ${colors.textPrimary} truncate`}>
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${colors.inputBg} ${colors.borderSubtle} ${colors.textSecondary}`}>
                                {getEventTypeLabel(event.type)}
                              </span>
                              <span className={`text-[11px] font-semibold ${colors.textMuted}`}>
                                {isTomorrow ? 'Tomorrow' : eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {event.startTime && (
                          <div className={`flex items-center gap-1.5 text-[11px] ${colors.textMuted} mt-2.5`}>
                            <Clock className="h-3 w-3" />
                            <span className="font-semibold">{event.startTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}