// app/components/employeeticketlogs/TimeRangeFilter.tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Calendar, ChevronDown, X } from 'lucide-react';

export type TimeRangeType = 'all' | 'this-year' | 'last-year' | 'this-month' | 'last-month' | 'custom';

export interface TimeRange {
  type: TimeRangeType;
  startDate?: Date;
  endDate?: Date;
}

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export { filterByTimeRange } from './timeRangeUtils';

export default function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  const { colors, cardCharacters } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const infoChar = cardCharacters.informative;

  const options: { type: TimeRangeType; label: string }[] = [
    { type: 'all', label: 'All Time' },
    { type: 'this-year', label: 'This Year' },
    { type: 'last-year', label: 'Last Year' },
    { type: 'this-month', label: 'This Month' },
    { type: 'last-month', label: 'Last Month' },
    { type: 'custom', label: 'Custom Range' },
  ];

  const getDateRange = (type: TimeRangeType): { startDate?: Date; endDate?: Date } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    switch (type) {
      case 'this-year':
        return {
          startDate: new Date(year, 0, 1),
          endDate: new Date(year, 11, 31, 23, 59, 59),
        };
      case 'last-year':
        return {
          startDate: new Date(year - 1, 0, 1),
          endDate: new Date(year - 1, 11, 31, 23, 59, 59),
        };
      case 'this-month':
        return {
          startDate: new Date(year, month, 1),
          endDate: new Date(year, month + 1, 0, 23, 59, 59),
        };
      case 'last-month':
        const lastMonth = month === 0 ? 11 : month - 1;
        const lastMonthYear = month === 0 ? year - 1 : year;
        return {
          startDate: new Date(lastMonthYear, lastMonth, 1),
          endDate: new Date(lastMonthYear, lastMonth + 1, 0, 23, 59, 59),
        };
      case 'all':
      default:
        return {};
    }
  };

  const handleOptionClick = (type: TimeRangeType) => {
    if (type === 'custom') {
      onChange({ type });
    } else {
      const range = getDateRange(type);
      onChange({ type, ...range });
      setIsOpen(false);
    }
  };

  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(customEndDate);
      endDate.setHours(23, 59, 59, 999);

      onChange({
        type: 'custom',
        startDate,
        endDate,
      });
      setIsOpen(false);
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  const handleClearCustomRange = () => {
    setCustomStartDate('');
    setCustomEndDate('');
    onChange({ type: 'all' });
  };

  const getDisplayLabel = () => {
    const option = options.find(o => o.type === value.type);
    if (value.type === 'custom' && value.startDate && value.endDate) {
      return `${value.startDate.toLocaleDateString()} - ${value.endDate.toLocaleDateString()}`;
    }
    return option?.label || 'All Time';
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative px-4 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 border-2 overflow-hidden bg-gradient-to-br ${colors.cardBg} ${colors.borderSubtle} ${colors.textSecondary} hover:${colors.borderHover} ${colors.shadowCard}`}
      >
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
        
        {/* Hover Glow */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
        />
        
        {/* Icon with animation */}
        <Calendar className="h-4 w-4 relative z-10 group-hover:rotate-12 group-hover:translate-x-0.5 transition-all duration-300" />
        
        <span className="relative z-10">{getDisplayLabel()}</span>
        
        <ChevronDown className={`h-4 w-4 relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div 
            className={`absolute right-0 mt-2 w-80 rounded-xl border-2 overflow-hidden z-50 bg-gradient-to-br ${colors.cardBg} ${colors.border} ${colors.shadowCard} backdrop-blur-sm dropdown-animate`}
          >
            {/* Paper Texture */}
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            
            <div className="relative p-3">
              {/* Show options when NOT in custom mode */}
              {value.type !== 'custom' && (
                <div className="space-y-1">
                  {options.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => handleOptionClick(option.type)}
                      className={`group w-full text-left px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 relative overflow-hidden ${
                        value.type === option.type
                          ? `bg-gradient-to-r ${infoChar.bg} ${infoChar.accent} border-2 ${infoChar.border}`
                          : `${colors.textSecondary} hover:bg-gradient-to-r ${colors.cardBgHover} border-2 ${colors.borderSubtle}`
                      }`}
                    >
                      {/* Paper Texture */}
                      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                      
                      {/* Hover Glow (only for non-active items) */}
                      {value.type !== option.type && (
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                        />
                      )}
                      
                      <span className="relative z-10">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Show custom date inputs when in custom mode */}
              {value.type === 'custom' && (
                <div className="space-y-3">
                  <div className="relative space-y-2">
                    <label className={`text-xs font-bold ${colors.textPrimary}`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className={`w-full px-3 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:${colors.borderHover} focus:ring-2 focus:ring-offset-0`}
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div className="relative space-y-2">
                    <label className={`text-xs font-bold ${colors.textPrimary}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      min={customStartDate}
                      className={`w-full px-3 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all duration-200 ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:${colors.borderHover} focus:ring-2 focus:ring-offset-0`}
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    {/* Apply Button */}
                    <button
                      onClick={handleApplyCustomRange}
                      disabled={!customStartDate || !customEndDate}
                      className={`group flex-1 relative px-4 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 overflow-hidden border-2 ${
                        customStartDate && customEndDate
                          ? `bg-gradient-to-r ${infoChar.bg} ${infoChar.accent} ${infoChar.border} ${colors.shadowCard}`
                          : `${colors.borderSubtle} ${colors.textMuted} cursor-not-allowed opacity-50`
                      }`}
                    >
                      {/* Paper Texture */}
                      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                      
                      {/* Hover Glow */}
                      {customStartDate && customEndDate && (
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                        />
                      )}
                      
                      <span className="relative z-10">Apply</span>
                    </button>
                    
                    {/* Back Button */}
                    <button
                      onClick={() => {
                        setCustomStartDate('');
                        setCustomEndDate('');
                        onChange({ type: 'all' });
                      }}
                      className={`group relative px-4 py-2.5 rounded-lg font-bold text-sm border-2 transition-all duration-300 overflow-hidden ${colors.borderSubtle} ${colors.textSecondary} hover:${colors.borderHover}`}
                    >
                      {/* Paper Texture */}
                      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                      
                      {/* Hover Glow */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                      />
                      
                      <span className="relative z-10">Back</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}