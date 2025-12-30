'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Calendar as CalendarIcon, Plus, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import CalendarGrid from './CalendarGrid';
import CalendarSidebar from './CalendarSidebar';
import CalendarEventModal from './CalendarEventModal';

interface CalendarEvent {
  _id: string;
  userId: string;
  username: string;
  title: string;
  description?: string;
  type: 'task' | 'deadline' | 'meeting' | 'reminder';
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  color: string;
  isAllDay: boolean;
  completed: boolean;
  reminder?: {
    enabled: boolean;
    minutesBefore: number;
  };
}

export default function PersonalCalendar() {
  const { colors, cardCharacters, theme } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, [currentDate, filterType]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      
      const startDate = getStartDate();
      const endDate = getEndDate();

      const params = new URLSearchParams({
        userId: user.username,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (filterType !== 'all') {
        params.append('type', filterType);
      }

      const response = await fetch(`/api/calendar?${params}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.events.map((e: any) => ({
          ...e,
          startDate: new Date(e.startDate),
          endDate: e.endDate ? new Date(e.endDate) : undefined
        })));
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const date = new Date(currentDate);
    date.setDate(1);
    return date;
  };

  const getEndDate = () => {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    date.setDate(0);
    return date;
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateEvent = (date?: Date) => {
    if (date) {
      setSelectedEvent({
        _id: '',
        userId: '',
        username: '',
        title: '',
        type: 'task',
        startDate: date,
        color: '#2196F3',
        isAllDay: false,
        completed: false
      });
    } else {
      setSelectedEvent(null);
    }
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleEventSave = async (eventData: any) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);

      if (selectedEvent && selectedEvent._id) {
        const response = await fetch('/api/calendar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ _id: selectedEvent._id, ...eventData })
        });

        if (response.ok) {
          fetchEvents();
          setIsModalOpen(false);
        }
      } else {
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.username,
            username: user.username,
            ...eventData
          })
        });

        if (response.ok) {
          fetchEvents();
          setIsModalOpen(false);
        }
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar?id=${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchEvents();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const getDateRangeText = () => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return currentDate.toLocaleDateString('en-US', options);
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDateClick = (date: Date) => {
    // Called from CalendarGrid
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <CalendarIcon className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h1 className={`text-xl font-black ${charColors.text}`}>Personal Calendar</h1>
                <p className={`text-xs ${colors.textMuted}`}>Organize your schedule with precision</p>
              </div>
            </div>
            
            <button
              onClick={() => handleCreateEvent()}
              className={`group relative overflow-hidden px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} hover:${colors.shadowHover} flex items-center space-x-2`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <Plus className="h-4 w-4 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">New Event</span>
            </button>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className={`group relative p-2 rounded-lg border transition-all duration-300 overflow-hidden ${colors.inputBg} ${colors.inputBorder}`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                  <ChevronLeft className={`h-4 w-4 relative z-10 ${colors.textSecondary} group-hover:translate-x-[-2px] transition-transform duration-300`} />
                </button>
                
                <button
                  onClick={handleToday}
                  className={`group relative px-3 py-2 rounded-lg border transition-all duration-300 overflow-hidden font-semibold text-sm ${colors.inputBg} ${colors.inputBorder} ${colors.textSecondary}`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                  <span className="relative z-10">Today</span>
                </button>
                
                <button
                  onClick={handleNext}
                  className={`group relative p-2 rounded-lg border transition-all duration-300 overflow-hidden ${colors.inputBg} ${colors.inputBorder}`}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                  <ChevronRight className={`h-4 w-4 relative z-10 ${colors.textSecondary} group-hover:translate-x-[2px] transition-transform duration-300`} />
                </button>
                
                <div className={`px-3 py-1 font-black ${charColors.text} text-lg ml-2`}>
                  {getDateRangeText()}
                </div>
              </div>

              {/* Month View Badge */}
              <div className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center gap-2 bg-gradient-to-r ${charColors.bg} ${charColors.border}`}>
                <CalendarIcon className={`h-3.5 w-3.5 ${charColors.iconColor}`} />
                Month View
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full lg:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${colors.textMuted} z-10`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className={`w-full pl-10 pr-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  />
                </div>

                {/* Filter */}
                <div className="relative w-full lg:w-40">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition-all appearance-none cursor-pointer ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                  >
                    <option value="all">All Events</option>
                    <option value="task">Tasks</option>
                    <option value="deadline">Deadlines</option>
                    <option value="meeting">Meetings</option>
                    <option value="reminder">Reminders</option>
                  </select>
                  <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 ${colors.textMuted} pointer-events-none`} />
                </div>
              </div>

              {/* Events Count */}
              <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${colors.inputBg} ${colors.inputBorder} flex items-center gap-2 ${colors.textSecondary}`}>
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{filteredEvents.length} {filteredEvents.length === 1 ? 'Event' : 'Events'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <CalendarGrid
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onCreateEvent={handleCreateEvent}
            loading={loading}
          />
        </div>
        
        <div className="xl:col-span-1">
          <CalendarSidebar
            currentDate={currentDate}
            events={filteredEvents}
            onEventClick={handleEventClick}
            onDateChange={setCurrentDate}
          />
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <CalendarEventModal
          event={selectedEvent}
          onClose={() => setIsModalOpen(false)}
          onSave={handleEventSave}
          onDelete={handleEventDelete}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${colors.cardBg} border ${colors.border} shadow-2xl`}>
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            
            <div className="relative flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-16 h-16 border-4 rounded-full ${colors.inputBorder}`}></div>
                <div className={`absolute inset-0 w-16 h-16 border-4 border-t-transparent rounded-full animate-spin`} style={{ borderColor: charColors.iconColor.replace('text-', ''), borderTopColor: 'transparent' }}></div>
              </div>
              <p className={`${colors.textSecondary} font-bold text-lg`}>Loading calendar...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}