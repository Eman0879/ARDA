// app/components/HRDownloadLogs/DateRangePicker.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClose: () => void;
  colors: any;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClose,
  colors
}: DateRangePickerProps) {
  const { cardCharacters } = useTheme();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const changeMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + delta);
      return newDate;
    });
  };

  const getMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isPast: true
      });
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push({
        day,
        isCurrentMonth: true,
        isPast: date < today
      });
    }

    // Next month's days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isPast: false
      });
    }

    return days;
  };

  const handleDateSelect = (day: number, isCurrentMonth: boolean, isPast: boolean) => {
    if (!isCurrentMonth) return;

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    if (selectingStart) {
      onStartDateChange(selectedDate);
      onEndDateChange(selectedDate);
      setSelectingStart(false);
    } else {
      if (!startDate || selectedDate >= startDate) {
        onEndDateChange(selectedDate);
        setSelectingStart(true);
      } else {
        onStartDateChange(selectedDate);
        onEndDateChange(selectedDate);
        setSelectingStart(false);
      }
    }
  };

  const isDateSelected = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === startDate || dateStr === endDate;
  };

  const isDateInBetween = (day: number, isCurrentMonth: boolean) => {
    if (!isCurrentMonth || !startDate || !endDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr > startDate && dateStr < endDate;
  };

  return (
    <div 
      ref={calendarRef}
      className={`absolute z-[9999] mt-2 p-4 rounded-xl w-full max-w-sm border-2 backdrop-blur-xl ${colors.shadowDropdown} bg-gradient-to-br ${colors.cardBg} ${
        selectingStart ? cardCharacters.informative.border : cardCharacters.creative.border
      }`}
    >
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      {/* Selection Indicator */}
      <div 
        className={`relative mb-4 p-3 rounded-lg border backdrop-blur-sm bg-gradient-to-br ${
          selectingStart ? cardCharacters.informative.bg : cardCharacters.creative.bg
        } ${
          selectingStart ? cardCharacters.informative.border : cardCharacters.creative.border
        }`}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <p className={`relative text-xs font-bold ${colors.textPrimary} mb-2`}>
          {selectingStart ? 'Select Start Date' : 'Select End Date'}
        </p>
        <div className="relative flex items-center gap-2 text-xs">
          <span 
            className={`px-2 py-1 rounded text-xs font-semibold border ${
              startDate 
                ? `bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${cardCharacters.informative.text}` 
                : `${colors.inputBg} ${colors.border} ${colors.textMuted}`
            }`}
          >
            Start: {startDate ? new Date(startDate).toLocaleDateString() : 'Not set'}
          </span>
          <span className={colors.textMuted}>→</span>
          <span 
            className={`px-2 py-1 rounded text-xs font-semibold border ${
              endDate 
                ? `bg-gradient-to-r ${cardCharacters.creative.bg} ${cardCharacters.creative.border} ${cardCharacters.creative.text}` 
                : `${colors.inputBg} ${colors.border} ${colors.textMuted}`
            }`}
          >
            End: {endDate ? new Date(endDate).toLocaleDateString() : 'Not set'}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className={`group p-2 rounded-lg transition-all border ${colors.border} ${colors.inputBg} hover:${colors.borderHover}`}
        >
          <ChevronLeft className={`h-4 w-4 ${colors.textPrimary} transition-transform duration-300 group-hover:-translate-x-0.5`} />
        </button>
        <span 
          className={`font-black text-sm ${
            selectingStart ? cardCharacters.informative.text : cardCharacters.creative.text
          }`}
        >
          {getMonthYear()}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className={`group p-2 rounded-lg transition-all border ${colors.border} ${colors.inputBg} hover:${colors.borderHover}`}
        >
          <ChevronRight className={`h-4 w-4 ${colors.textPrimary} transition-transform duration-300 group-hover:translate-x-0.5`} />
        </button>
      </div>

      <div className="relative grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div 
            key={day} 
            className={`text-center font-bold text-xs py-2 ${
              selectingStart ? cardCharacters.informative.text : cardCharacters.creative.text
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="relative grid grid-cols-7 gap-1">
        {generateCalendarDays().map((dayObj, idx) => {
          const year = currentMonth.getFullYear();
          const month = currentMonth.getMonth();
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
          const isSelected = isDateSelected(dayObj.day, dayObj.isCurrentMonth);
          const isInBetween = isDateInBetween(dayObj.day, dayObj.isCurrentMonth);
          const isStart = dateStr === startDate;
          const isEnd = dateStr === endDate;
          
          return (
            <button
              key={idx}
              onClick={() => handleDateSelect(dayObj.day, dayObj.isCurrentMonth, dayObj.isPast)}
              disabled={!dayObj.isCurrentMonth}
              className={`group aspect-square p-1 rounded-lg text-xs font-semibold transition-all ${
                !dayObj.isCurrentMonth
                  ? `opacity-30 cursor-default ${colors.textMuted}`
                  : isSelected
                    ? `border-2 font-black ${
                        isStart 
                          ? `bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${cardCharacters.informative.text}` 
                          : `bg-gradient-to-br ${cardCharacters.creative.bg} ${cardCharacters.creative.border} ${cardCharacters.creative.text}`
                      }`
                    : isInBetween
                      ? `${colors.calendarDayHover.replace('hover:', '')} ${colors.textPrimary}`
                      : `cursor-pointer ${colors.textPrimary} ${colors.inputBg} hover:${colors.borderHover} hover:border`
              }`}
            >
              {dayObj.day}
            </button>
          );
        })}
      </div>

      <div 
        className={`relative flex gap-2 mt-4 pt-4 border-t ${
          selectingStart ? cardCharacters.informative.border : cardCharacters.creative.border
        }`}
      >
        <button
          onClick={() => {
            onStartDateChange('');
            onEndDateChange('');
            setSelectingStart(true);
          }}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-xs border ${colors.border} ${colors.inputBg} ${colors.textPrimary} hover:${colors.borderHover}`}
        >
          Clear
        </button>
        <button
          onClick={onClose}
          disabled={!startDate || !endDate}
          className={`group relative flex-1 px-4 py-2 rounded-lg font-semibold transition-all text-xs overflow-hidden ${
            startDate && endDate
              ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border-transparent ${colors.shadowCard} hover:${colors.shadowHover}`
              : `${colors.inputBg} ${colors.border} opacity-50 cursor-not-allowed`
          }`}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
          {startDate && endDate && (
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
            ></div>
          )}
          <span className="relative z-10">Done</span>
        </button>
      </div>
    </div>
  );
}