'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Plus, X as XIcon, Calendar as CalendarIcon, Clock, Edit2, Eye } from 'lucide-react';

interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  type: string;
  startDate: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  isAllDay: boolean;
  completed: boolean;
}

interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
  onCreateEvent: (date: Date) => void;
  loading: boolean;
}

export default function CalendarGrid({ currentDate, events, onEventClick, onDateClick, onCreateEvent, loading }: CalendarGridProps) {
  const { colors, cardCharacters, theme } = useTheme();
  const charColors = cardCharacters.informative;
  const urgentColors = cardCharacters.urgent;
  
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
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

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
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

  const getEventIcon = (type: string) => {
    const icons: Record<string, string> = {
      task: '📝',
      deadline: '⏰',
      meeting: '👥',
      reminder: '🔔'
    };
    return icons[type] || '📅';
  };

  const handleDayClick = (day: { date: Date; isCurrentMonth: boolean }) => {
    if (!day.isCurrentMonth) return;
    
    const eventsForDay = getEventsForDate(day.date);
    setSelectedDayEvents(eventsForDay);
    setSelectedDay(day.date);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const closeDayEvents = () => {
    setSelectedDay(null);
    setSelectedDayEvents([]);
  };

  if (loading) {
    return (
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border} ${colors.shadowCard} flex items-center justify-center h-[600px]`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
        
        <div className="relative text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse" style={{ backgroundColor: charColors.iconColor.replace('text-', '') }} />
            <div className={`w-16 h-16 border-4 rounded-full ${colors.inputBorder}`}></div>
            <div className={`absolute inset-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin`} style={{ borderColor: charColors.iconColor.replace('text-', ''), borderTopColor: 'transparent' }}></div>
          </div>
          <p className={`${colors.textSecondary} font-bold text-lg`}>Loading grid...</p>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth(currentDate);
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <>
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
        
        <div className="relative p-5">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day, index) => (
              <div key={day} className={`text-center text-xs font-black uppercase tracking-wider py-3 rounded-lg ${
                index === 0 || index === 6 
                  ? `${charColors.text} bg-gradient-to-br ${charColors.bg}` 
                  : colors.textSecondary
              }`}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.date);
              const today = isToday(day.date);
              const pastDate = isPastDate(day.date);
              const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => day.isCurrentMonth && handleDayClick(day)}
                  className={`group relative min-h-32 p-2 rounded-xl transition-all duration-300 text-left ${
                    !day.isCurrentMonth ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
                  }`}
                >
                  <div className={`absolute inset-0.5 rounded-xl transition-all duration-300 ${
                    pastDate && day.isCurrentMonth 
                      ? `${colors.inputBg} opacity-60` 
                      : today 
                      ? `bg-gradient-to-br ${charColors.bg} shadow-md` 
                      : !day.isCurrentMonth
                      ? `${colors.inputBg} opacity-20`
                      : isWeekend
                      ? `${colors.inputBg}`
                      : colors.inputBg
                  }`}></div>
                  
                  <div className={`absolute inset-0 rounded-xl border transition-all duration-300 ${
                    pastDate && day.isCurrentMonth
                      ? `border-dashed ${colors.borderSubtle} opacity-40` 
                      : today 
                      ? `border-2 ${charColors.border}` 
                      : !day.isCurrentMonth
                      ? `${colors.borderSubtle} opacity-30`
                      : colors.inputBorder
                  }`}></div>
                  
                  {!pastDate && day.isCurrentMonth && (
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none"
                      style={{ boxShadow: `inset 0 0 15px ${colors.glowPrimary}` }}
                    ></div>
                  )}

                  <div className={`relative z-10 text-sm font-black mb-2 px-1.5 py-1 rounded-md transition-all duration-300 flex items-center justify-between ${
                    pastDate && day.isCurrentMonth 
                      ? `${colors.textMuted} line-through decoration-2` 
                      : today 
                      ? `${charColors.text}` 
                      : !day.isCurrentMonth
                      ? `${colors.textMuted} opacity-40`
                      : isWeekend
                      ? charColors.accent
                      : colors.textPrimary
                  }`}>
                    <span>{day.date.getDate()}</span>
                    {pastDate && day.isCurrentMonth && (
                      <XIcon className="h-3 w-3 opacity-60" />
                    )}
                  </div>

                  <div className="relative z-10 space-y-1.5">
                    {dayEvents.slice(0, 2).map(event => {
                      const eventColor = getEventColor(event);
                      const isPastEvent = pastDate || event.completed;
                      
                      return (
                        <div
                          key={event._id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(event);
                          }}
                          className="group/event w-full transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        >
                          <div className={`relative overflow-hidden rounded-lg border backdrop-blur-sm px-2 py-1.5 text-left ${isPastEvent ? 'opacity-60' : 'opacity-100'} ${colors.inputBg} ${colors.inputBorder}`}>
                            {!isPastEvent && (
                              <div 
                                className="absolute inset-0 opacity-0 group-hover/event:opacity-100 transition-opacity duration-500"
                                style={{ boxShadow: `inset 0 0 10px ${eventColor}30` }}
                              ></div>
                            )}
                            
                            <div className="relative flex items-center gap-2">
                              <span className="text-[10px] opacity-80">{getEventIcon(event.type)}</span>
                              <span className={`text-[10px] font-bold truncate flex-1 ${event.completed ? 'line-through' : ''}`} style={{ color: eventColor }}>
                                {event.title}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {dayEvents.length > 2 && (
                      <div className={`relative text-center py-1 px-1 rounded-lg border ${colors.borderSubtle} ${colors.inputBg} transition-all duration-300`}>
                        <span className={`text-[10px] font-semibold ${pastDate ? colors.textMuted : colors.textSecondary}`}>
                          +{dayEvents.length - 2} more
                        </span>
                      </div>
                    )}
                  </div>

                  {today && (
                    <div className="absolute top-2 right-2 pointer-events-none">
                      <div className={`h-2 w-2 rounded-full animate-pulse shadow-sm`} style={{ backgroundColor: charColors.iconColor.replace('text-', '') }}></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`mt-5 pt-4 border-t border-dashed ${colors.borderSubtle}`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${colors.textSecondary} font-semibold flex items-center gap-2`}>
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {events.length} event{events.length !== 1 ? 's' : ''} in {
                    currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Events Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
             onClick={closeDayEvents}>
          <div 
            className={`w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border-2 ${colors.inputBg}`}
            style={{ borderColor: charColors.border.replace('border-', '') }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
            
            {/* Header */}
            <div 
              className={`relative overflow-hidden p-6 border-b-2 flex items-center justify-between bg-gradient-to-br ${charColors.bg} backdrop-blur-sm`}
              style={{ borderColor: charColors.border.replace('border-', '') }}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative">
                <h2 className={`text-2xl font-black ${charColors.text} flex items-center gap-3`}>
                  <CalendarIcon className={`h-6 w-6 ${charColors.iconColor}`} />
                  {formatDateDisplay(selectedDay)}
                </h2>
                <p className={`text-sm ${colors.textSecondary} mt-1 font-semibold`}>
                  {selectedDayEvents.length} event{selectedDayEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={closeDayEvents}
                className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden border-2 bg-gradient-to-br ${colors.cardBg} ${urgentColors.border}`}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 20px ${urgentColors.iconColor.replace('text-', '')}` }}
                ></div>
                <XIcon className={`h-5 w-5 relative z-10 ${urgentColors.iconColor}`} />
              </button>
            </div>

            {/* Action Button */}
            {!isPastDate(selectedDay) && (
              <div 
                className={`relative overflow-hidden p-4 border-b-2 bg-gradient-to-br ${colors.cardBg} backdrop-blur-sm`}
                style={{ borderColor: charColors.border.replace('border-', '') }}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <button
                  onClick={() => {
                    onCreateEvent(selectedDay);
                    closeDayEvents();
                  }}
                  className={`group relative overflow-hidden w-full px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} flex items-center justify-center gap-2`}
                >
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
                  ></div>
                  <Plus className="h-5 w-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="relative z-10">Create New Event</span>
                </button>
              </div>
            )}

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedDayEvents.length === 0 ? (
                <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.neutral.bg} ${cardCharacters.neutral.border} p-10 text-center`}>
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                  <div className="relative">
                    <CalendarIcon className={`h-16 w-16 ${colors.textMuted} mx-auto mb-4 opacity-50`} />
                    <h3 className={`text-xl font-black ${colors.textPrimary} mb-3`}>
                      No events
                    </h3>
                    <p className={`${colors.textSecondary} text-sm font-semibold`}>
                      {isPastDate(selectedDay) 
                        ? 'This day passed with no events' 
                        : 'Click "Create New Event" to schedule something'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {selectedDayEvents.map(event => {
                    const eventColor = getEventColor(event);
                    const isPastEvent = isPastDate(selectedDay) || event.completed;
                    
                    return (
                      <button
                        key={event._id}
                        onClick={() => {
                          onEventClick(event);
                          closeDayEvents();
                        }}
                        disabled={isPastEvent && isPastDate(selectedDay)}
                        className={`w-full text-left transition-all duration-300 hover:scale-[1.02] ${
                          isPastEvent && isPastDate(selectedDay) ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm p-4 ${isPastEvent ? 'opacity-70' : 'opacity-100'} ${colors.inputBg} ${colors.inputBorder}`}>
                          {!(isPastEvent && isPastDate(selectedDay)) && (
                            <div 
                              className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                              style={{ boxShadow: `inset 0 0 20px ${eventColor}30` }}
                            ></div>
                          )}
                          
                          <div className="relative">
                            <div className="flex items-start justify-between mb-2.5">
                              <div className="flex items-center gap-3.5 flex-1">
                                <div className="text-xl">{getEventIcon(event.type)}</div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`font-black ${colors.textPrimary} ${event.completed ? 'line-through opacity-60' : ''}`}>
                                    {event.title}
                                  </h3>
                                  {event.description && (
                                    <p className={`text-xs ${colors.textMuted} mt-1 line-clamp-2`}>
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${colors.inputBg} ${colors.borderSubtle} ${colors.textSecondary}`}>
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </div>
                                {isPastEvent && isPastDate(selectedDay) ? (
                                  <Eye className={`h-4 w-4 ${colors.textMuted}`} />
                                ) : (
                                  <Edit2 className={`h-4 w-4 ${colors.textSecondary}`} />
                                )}
                              </div>
                            </div>
                            
                            {(event.startTime || event.isAllDay) && (
                              <div className={`flex items-center gap-2 text-sm ${colors.textSecondary} font-semibold mt-2`}>
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                  {event.isAllDay ? 'All day' : `${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''}`}
                                </span>
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
      )}
    </>
  );
}