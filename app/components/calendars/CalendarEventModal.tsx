'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { X, Trash2, Save, Clock, Calendar as CalendarIcon, AlertCircle, Check, Edit2, Tag } from 'lucide-react';

interface CalendarEvent {
  _id: string;
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
}

interface CalendarEventModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onSave: (eventData: any) => void;
  onDelete: (eventId: string) => void;
}

const EVENT_TYPES = [
  { value: 'task', label: 'Task', color: '#2196F3', emoji: '📝' },
  { value: 'deadline', label: 'Deadline', color: '#FF9800', emoji: '⏰' },
  { value: 'meeting', label: 'Meeting', color: '#8D6E63', emoji: '👥' },
  { value: 'reminder', label: 'Reminder', color: '#4CAF50', emoji: '🔔' }
];

export default function CalendarEventModal({ event, onClose, onSave, onDelete }: CalendarEventModalProps) {
  const { colors, cardCharacters, theme } = useTheme();
  const charColors = cardCharacters.informative;
  const urgentColors = cardCharacters.urgent;
  const completedColors = cardCharacters.completed;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'task' as 'task' | 'deadline' | 'meeting' | 'reminder',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    startTime: '',
    endTime: '',
    isAllDay: false,
    completed: false,
    reminderMinutes: 15
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const startDatePickerRef = useRef<HTMLDivElement>(null);
  const endDatePickerRef = useRef<HTMLDivElement>(null);
  const startTimePickerRef = useRef<HTMLDivElement>(null);
  const endTimePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        type: event.type,
        startDate: new Date(event.startDate).toISOString().split('T')[0],
        endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
        startTime: event.startTime || '',
        endTime: event.endTime || '',
        isAllDay: event.isAllDay,
        completed: event.completed,
        reminderMinutes: 15
      });
    }
  }, [event]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (startDatePickerRef.current && !startDatePickerRef.current.contains(event.target as Node)) {
        setShowStartDatePicker(false);
      }
      if (endDatePickerRef.current && !endDatePickerRef.current.contains(event.target as Node)) {
        setShowEndDatePicker(false);
      }
      if (startTimePickerRef.current && !startTimePickerRef.current.contains(event.target as Node)) {
        setShowStartTimePicker(false);
      }
      if (endTimePickerRef.current && !endTimePickerRef.current.contains(event.target as Node)) {
        setShowEndTimePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedEventType = EVENT_TYPES.find(t => t.value === formData.type);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (formData.endDate && formData.startDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (formData.startTime && formData.endTime && !formData.isAllDay) {
      if (formData.startDate === formData.endDate || !formData.endDate) {
        if (formData.endTime <= formData.startTime) {
          newErrors.endTime = 'End time must be after start time';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    const eventData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
      startTime: formData.isAllDay ? '' : formData.startTime,
      endTime: formData.isAllDay ? '' : formData.endTime,
      color: selectedEventType?.color || '#2196F3',
      isAllDay: formData.isAllDay,
      completed: formData.completed,
      reminder: {
        enabled: false,
        minutesBefore: formData.reminderMinutes
      }
    };

    onSave(eventData);
  };

  const handleDelete = () => {
    if (event) {
      onDelete(event._id);
    }
  };

  const renderDatePicker = (currentDate: string, onChange: (date: string) => void, showPicker: boolean) => {
    const date = currentDate ? new Date(currentDate) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const today = new Date();
    
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ 
        day: prevMonthDays - i, 
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false 
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        date: new Date(year, month, i),
        isCurrentMonth: true 
      });
    }
    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      days.push({ 
        day: i, 
        date: new Date(year, month + 1, i),
        isCurrentMonth: false 
      });
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    return (
      <div className={`absolute top-full left-0 mt-2 z-50 ${
        showPicker ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      } transition-all duration-300`}>
        <div className={`rounded-xl border shadow-2xl p-4 min-w-[280px] backdrop-blur-md ${colors.dropdownBg} ${colors.dropdownBorder}`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`font-black ${colors.textPrimary}`}>
              {monthNames[month]} {year}
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(newDate.getMonth() - 1);
                  onChange(newDate.toISOString().split('T')[0]);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${colors.inputBg} ${colors.textSecondary} hover:scale-110`}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => {
                  const newDate = new Date(date);
                  newDate.setMonth(newDate.getMonth() + 1);
                  onChange(newDate.toISOString().split('T')[0]);
                }}
                className={`p-2 rounded-lg transition-all duration-200 ${colors.inputBg} ${colors.textSecondary} hover:scale-110`}
              >
                →
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1.5 mb-2.5">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className={`text-center text-xs font-black uppercase ${colors.textMuted} py-1.5`}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1.5">
            {days.map(({ day, date: cellDate, isCurrentMonth }, index) => {
              const isSelected = currentDate === cellDate.toISOString().split('T')[0];
              const isToday = cellDate.getDate() === today.getDate() && 
                             cellDate.getMonth() === today.getMonth() && 
                             cellDate.getFullYear() === today.getFullYear();
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    onChange(cellDate.toISOString().split('T')[0]);
                    if (showPicker === showStartDatePicker) setShowStartDatePicker(false);
                    if (showPicker === showEndDatePicker) setShowEndDatePicker(false);
                  }}
                  className={`aspect-square text-xs rounded-lg transition-all duration-200 font-semibold hover:scale-110 ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  } ${
                    isSelected 
                      ? `bg-gradient-to-br ${charColors.bg} ${charColors.text} shadow-md` 
                      : isToday 
                      ? `border-2 ${charColors.border} ${charColors.text}`
                      : `${colors.textPrimary} ${colors.inputBg} hover:${colors.inputBorder}`
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTimePicker = (currentTime: string, onChange: (time: string) => void, showPicker: boolean) => {
    const [selectedHour, setSelectedHour] = useState<number | null>(
      currentTime ? parseInt(currentTime.split(':')[0]) : null
    );

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 15, 30, 45];

    return (
      <div className={`absolute top-full left-0 mt-2 z-50 ${
        showPicker ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      } transition-all duration-300`}>
        <div className={`rounded-xl border shadow-2xl p-3 w-72 backdrop-blur-md ${colors.dropdownBg} ${colors.dropdownBorder}`}>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className={`text-xs font-black uppercase mb-2 ${colors.textSecondary}`}>Hour</div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {hours.map((hour) => {
                  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                  const period = hour < 12 ? 'AM' : 'PM';
                  const isSelected = selectedHour === hour;
                  
                  return (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => setSelectedHour(hour)}
                      className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 font-semibold text-left hover:scale-105 ${
                        isSelected 
                          ? `bg-gradient-to-r ${charColors.bg} ${charColors.text} shadow-md` 
                          : `${colors.textPrimary} ${colors.inputBg}`
                      }`}
                    >
                      {displayHour} {period}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1">
              <div className={`text-xs font-black uppercase mb-2 ${colors.textSecondary}`}>Minute</div>
              <div className="space-y-2">
                {minutes.map((minute) => {
                  return (
                    <button
                      key={minute}
                      type="button"
                      disabled={selectedHour === null}
                      onClick={() => {
                        if (selectedHour !== null) {
                          const timeStr = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                          onChange(timeStr);
                          if (showPicker === showStartTimePicker) setShowStartTimePicker(false);
                          if (showPicker === showEndTimePicker) setShowEndTimePicker(false);
                          setSelectedHour(null);
                        }
                      }}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 font-semibold hover:scale-105 ${
                        selectedHour === null 
                          ? `${colors.inputBg} ${colors.textMuted} cursor-not-allowed` 
                          : `${colors.textPrimary} ${colors.inputBg} border ${colors.inputBorder}`
                      }`}
                    >
                      :{minute.toString().padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {selectedHour !== null && (
            <div className={`mt-3 pt-3 border-t ${colors.borderSubtle} text-center`}>
              <p className={`text-xs ${colors.textMuted} font-semibold`}>
                Select a minute to confirm
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div 
        className={`w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border-2 ${colors.inputBg}`}
        style={{ borderColor: charColors.border.replace('border-', '') }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.01] pointer-events-none`}></div>
        
        {/* Header */}
        <div 
          className={`relative overflow-hidden p-6 border-b-2 flex items-center justify-between bg-gradient-to-br ${charColors.bg} backdrop-blur-sm`}
          style={{ borderColor: charColors.border.replace('border-', '') }}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative flex items-center space-x-4">
            <div className={`p-3.5 rounded-xl bg-gradient-to-r ${charColors.bg}`}>
              <CalendarIcon className={`h-6 w-6 ${charColors.iconColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-black ${charColors.text} flex items-center gap-2`}>
                {event ? (
                  <>
                    <Edit2 className={`h-5 w-5 ${cardCharacters.creative.iconColor}`} />
                    Edit Event
                  </>
                ) : (
                  <>
                    <CalendarIcon className={`h-5 w-5 ${charColors.iconColor}`} />
                    New Event
                  </>
                )}
              </h2>
              <p className={`text-sm ${colors.textSecondary} mt-1 font-semibold`}>
                {event ? 'Update event details' : 'Add a new event'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden border-2 bg-gradient-to-br ${colors.cardBg} ${urgentColors.border}`}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 20px ${urgentColors.iconColor.replace('text-', '')}` }}
            ></div>
            <X className={`h-5 w-5 relative z-10 ${urgentColors.iconColor}`} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Title */}
          <div className="space-y-2">
            <label className={`block text-sm font-black ${colors.textPrimary} flex items-center gap-2`}>
              <div className={`h-2 w-2 rounded-full ${charColors.iconColor}`}></div>
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${colors.inputBg} border ${errors.title ? urgentColors.border : colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
              placeholder="What's happening?"
            />
            {errors.title && (
              <p className={`text-sm ${urgentColors.text} flex items-center gap-1.5 mt-1 font-semibold`}>
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className={`block text-sm font-black ${colors.textPrimary} flex items-center gap-2`}>
              <div className={`h-2 w-2 rounded-full ${cardCharacters.creative.iconColor}`}></div>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl text-sm transition-all resize-none ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
              rows={3}
              placeholder="Add details..."
            />
          </div>

          {/* Event Type */}
          <div className="space-y-3">
            <label className={`block text-sm font-black ${colors.textPrimary} flex items-center gap-2`}>
              <Tag className={`h-4 w-4 ${charColors.iconColor}`} />
              Event Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EVENT_TYPES.map(type => {
                const isSelected = formData.type === type.value;
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.value as any })}
                    className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm p-4 transition-all duration-300 hover:scale-105 ${colors.inputBg} ${isSelected ? charColors.border : colors.borderSubtle}`}
                  >
                    {isSelected && (
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ boxShadow: `inset 0 0 20px ${type.color}30` }}
                      ></div>
                    )}
                    <div className="relative">
                      <div className="text-2xl mb-2">{type.emoji}</div>
                      <div className={`text-xs font-black ${isSelected ? charColors.text : colors.textSecondary}`}>
                        {type.label}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: type.color }}></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Day Toggle */}
          <div className={`flex items-center space-x-3 p-4 rounded-xl border ${charColors.border} bg-gradient-to-r ${charColors.bg}`}>
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
              className="sr-only peer"
            />
            <label
              htmlFor="isAllDay"
              className={`relative h-6 w-11 cursor-pointer rounded-full transition-colors duration-300 ${
                formData.isAllDay 
                  ? `bg-gradient-to-r ${colors.buttonPrimary}` 
                  : colors.inputBg
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                formData.isAllDay ? 'translate-x-5' : ''
              }`} />
            </label>
            <label htmlFor="isAllDay" className={`text-sm font-black ${colors.textPrimary} cursor-pointer flex items-center gap-2`}>
              <Clock className={`h-4 w-4 ${charColors.iconColor}`} />
              <span>All day event</span>
            </label>
          </div>

          {/* Date & Time */}
          <div className={`space-y-4 p-6 rounded-xl border ${colors.border} backdrop-blur-sm ${colors.inputBg}`}>
            <h3 className={`text-sm font-black ${colors.textPrimary} flex items-center gap-2`}>
              <CalendarIcon className={`h-4 w-4 ${charColors.iconColor}`} />
              Date & Time
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`block text-xs font-black ${colors.textSecondary}`}>Start Date *</label>
                <div className="relative" ref={startDatePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowStartDatePicker(!showStartDatePicker);
                      setShowEndDatePicker(false);
                      setShowStartTimePicker(false);
                      setShowEndTimePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold ${
                      errors.startDate ? urgentColors.border : colors.inputBorder
                    } ${colors.inputBg} ${colors.textPrimary}`}
                  >
                    <span>{formData.startDate || 'Select date'}</span>
                    <CalendarIcon className={`h-4 w-4 ${colors.textMuted}`} />
                  </button>
                  {renderDatePicker(formData.startDate, (date) => setFormData({ ...formData, startDate: date }), showStartDatePicker)}
                  {errors.startDate && (
                    <p className={`text-xs ${urgentColors.text} mt-1 font-semibold`}>{errors.startDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-xs font-black ${colors.textSecondary}`}>End Date</label>
                <div className="relative" ref={endDatePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEndDatePicker(!showEndDatePicker);
                      setShowStartDatePicker(false);
                      setShowStartTimePicker(false);
                      setShowEndTimePicker(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold ${
                      errors.endDate ? urgentColors.border : colors.inputBorder
                    } ${colors.inputBg} ${colors.textPrimary}`}
                  >
                    <span>{formData.endDate || 'Select date'}</span>
                    <CalendarIcon className={`h-4 w-4 ${colors.textMuted}`} />
                  </button>
                  {renderDatePicker(formData.endDate || formData.startDate, (date) => setFormData({ ...formData, endDate: date }), showEndDatePicker)}
                  {errors.endDate && (
                    <p className={`text-xs ${urgentColors.text} mt-1 font-semibold`}>{errors.endDate}</p>
                  )}
                </div>
              </div>
            </div>

            {!formData.isAllDay && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <div className="space-y-2">
                  <label className={`block text-xs font-black ${colors.textSecondary}`}>Start Time</label>
                  <div className="relative" ref={startTimePickerRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStartTimePicker(!showStartTimePicker);
                        setShowStartDatePicker(false);
                        setShowEndDatePicker(false);
                        setShowEndTimePicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold ${colors.inputBorder} ${colors.inputBg} ${colors.textPrimary}`}
                    >
                      <span>{formData.startTime ? (() => {
                        const [hour, minute] = formData.startTime.split(':').map(Number);
                        return hour >= 12 
                          ? `${hour === 12 ? 12 : hour - 12}:${minute.toString().padStart(2, '0')} PM`
                          : `${hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} AM`;
                      })() : 'Select time'}</span>
                      <Clock className={`h-4 w-4 ${colors.textMuted}`} />
                    </button>
                    {renderTimePicker(formData.startTime, (time) => setFormData({ ...formData, startTime: time }), showStartTimePicker)}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`block text-xs font-black ${colors.textSecondary}`}>End Time</label>
                  <div className="relative" ref={endTimePickerRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEndTimePicker(!showEndTimePicker);
                        setShowStartDatePicker(false);
                        setShowEndDatePicker(false);
                        setShowStartTimePicker(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold ${
                        errors.endTime ? urgentColors.border : colors.inputBorder
                      } ${colors.inputBg} ${colors.textPrimary}`}
                    >
                      <span>{formData.endTime ? (() => {
                        const [hour, minute] = formData.endTime.split(':').map(Number);
                        return hour >= 12 
                          ? `${hour === 12 ? 12 : hour - 12}:${minute.toString().padStart(2, '0')} PM`
                          : `${hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} AM`;
                      })() : 'Select time'}</span>
                      <Clock className={`h-4 w-4 ${colors.textMuted}`} />
                    </button>
                    {renderTimePicker(formData.endTime, (time) => setFormData({ ...formData, endTime: time }), showEndTimePicker)}
                    {errors.endTime && (
                      <p className={`text-xs ${urgentColors.text} mt-1 font-semibold`}>{errors.endTime}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Completed Toggle */}
          {event && (formData.type === 'task' || formData.type === 'deadline') && (
            <div className={`flex items-center space-x-3 p-4 rounded-xl border ${completedColors.border} bg-gradient-to-r ${completedColors.bg}`}>
              <div className="relative">
                <input
                  type="checkbox"
                  id="completed"
                  checked={formData.completed}
                  onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                  className="peer sr-only"
                />
                <label
                  htmlFor="completed"
                  className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                    formData.completed 
                      ? `bg-gradient-to-r ${completedColors.bg} ${completedColors.border}` 
                      : colors.borderSubtle
                  }`}
                >
                  {formData.completed && <Check className={`h-4 w-4 ${completedColors.iconColor}`} />}
                </label>
              </div>
              <label htmlFor="completed" className={`text-sm font-black ${colors.textPrimary} cursor-pointer flex items-center gap-2`}>
                <Check className={`h-4 w-4 ${completedColors.iconColor}`} />
                <span>Mark as completed</span>
              </label>
            </div>
          )}
        </form>

        {/* Footer */}
        <div 
          className={`relative overflow-hidden p-6 border-t-2 flex items-center justify-between bg-gradient-to-br ${colors.cardBg} backdrop-blur-sm`}
          style={{ borderColor: charColors.border.replace('border-', '') }}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
          {event ? (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className={`group relative overflow-hidden px-5 py-3 rounded-xl border transition-all duration-300 font-semibold hover:scale-105 ${urgentColors.border} bg-gradient-to-r ${urgentColors.bg} ${urgentColors.text}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 20px ${urgentColors.iconColor.replace('text-', '')}` }}
              ></div>
              <div className="relative flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </div>
            </button>
          ) : (
            <div />
          )}
          
          <div className="flex items-center gap-3 relative z-10">
            <button
              type="button"
              onClick={onClose}
              className={`px-5 py-3 rounded-xl border transition-all duration-300 font-semibold hover:scale-105 ${colors.inputBorder} ${colors.inputBg} ${colors.textPrimary}`}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              onClick={handleSubmit}
              className={`group relative overflow-hidden px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} flex items-center gap-2`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
              ></div>
              <Save className="h-4.5 w-4.5 relative z-10" />
              <span className="relative z-10">{event ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <div className={`relative overflow-hidden rounded-2xl border ${colors.border} shadow-2xl m-4 max-w-sm w-full ${colors.inputBg}`}>
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${urgentColors.bg} border ${urgentColors.border}`}>
                    <Trash2 className={`h-6 w-6 ${urgentColors.iconColor}`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-black ${colors.textPrimary}`}>Delete Event?</h3>
                    <p className={`text-sm ${colors.textSecondary} mt-1 font-semibold`}>This cannot be undone</p>
                  </div>
                </div>
                
                <p className={`text-sm ${colors.textSecondary} mb-6 p-4 rounded-xl font-semibold ${colors.inputBg} border ${colors.borderSubtle}`}>
                  Delete "<span className="font-black">{formData.title}</span>"? All details will be removed.
                </p>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-all duration-300 font-semibold hover:scale-105 ${colors.inputBorder} ${colors.inputBg} ${colors.textPrimary}`}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className={`flex-1 px-4 py-3 rounded-xl border border-transparent transition-all duration-300 font-semibold shadow-lg hover:scale-105 bg-gradient-to-r ${urgentColors.bg} ${urgentColors.text}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}