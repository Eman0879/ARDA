// app/components/HRDownloadLogs/LogSelector.tsx
'use client';

import React from 'react';
import { Globe, Building2, ChevronDown, Loader2 } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface LogSelectorProps {
  selectedType: 'org' | 'dept';
  onTypeChange: (type: 'org' | 'dept') => void;
  departments: string[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  loadingDepartments: boolean;
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  colors: any;
}

export default function LogSelector({
  selectedType,
  onTypeChange,
  departments,
  selectedDepartment,
  onDepartmentChange,
  loadingDepartments,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  colors
}: LogSelectorProps) {
  const { cardCharacters } = useTheme();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
      {/* Type Selector */}
      <div>
        <label className={`block text-xs font-bold ${colors.textMuted} mb-2`}>Log Type</label>
        <div className="flex gap-2">
          <button
            onClick={() => onTypeChange('org')}
            className={`group relative flex-1 p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden ${
              selectedType === 'org'
                ? `bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} ${colors.shadowCard}`
                : `bg-gradient-to-br ${colors.cardBg} ${colors.border} hover:${colors.borderHover}`
            }`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            {selectedType === 'org' && (
              <div 
                className="absolute inset-0 opacity-50"
                style={{ boxShadow: `inset 0 0 20px ${colors.glowWarning}` }}
              ></div>
            )}
            <div className="relative flex flex-col items-center gap-1">
              <Globe className={`h-5 w-5 transition-transform duration-300 ${selectedType === 'org' ? `${cardCharacters.urgent.iconColor} scale-110` : `${colors.textMuted} group-hover:scale-105`}`} />
              <span className={`text-xs font-bold ${selectedType === 'org' ? cardCharacters.urgent.text : colors.textMuted}`}>
                Organization
              </span>
            </div>
          </button>

          <button
            onClick={() => onTypeChange('dept')}
            className={`group relative flex-1 p-3 rounded-lg border-2 transition-all duration-300 overflow-hidden ${
              selectedType === 'dept'
                ? `bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${colors.shadowCard}`
                : `bg-gradient-to-br ${colors.cardBg} ${colors.border} hover:${colors.borderHover}`
            }`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            {selectedType === 'dept' && (
              <div 
                className="absolute inset-0 opacity-50"
                style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
              ></div>
            )}
            <div className="relative flex flex-col items-center gap-1">
              <Building2 className={`h-5 w-5 transition-transform duration-300 ${selectedType === 'dept' ? `${cardCharacters.informative.iconColor} scale-110` : `${colors.textMuted} group-hover:scale-105`}`} />
              <span className={`text-xs font-bold ${selectedType === 'dept' ? cardCharacters.informative.text : colors.textMuted}`}>
                Department
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Department Selector - Only for dept type */}
      <div>
        <label className={`block text-xs font-bold ${colors.textMuted} mb-2`}>
          {selectedType === 'dept' ? 'Select Department' : 'Department'}
        </label>
        {selectedType === 'dept' ? (
          loadingDepartments ? (
            <div className={`relative w-full h-11 px-4 rounded-lg border-2 flex items-center gap-2 overflow-hidden bg-gradient-to-br ${colors.cardBg} ${colors.borderStrong}`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <Loader2 className={`relative h-4 w-4 ${cardCharacters.informative.iconColor} animate-spin`} />
              <span className={`relative text-xs ${cardCharacters.informative.text} font-semibold`}>Loading...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className={`relative w-full h-11 px-4 rounded-lg border-2 flex items-center overflow-hidden bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <p className={`relative ${cardCharacters.urgent.text} font-semibold text-xs`}>No departments found</p>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className={`w-full h-11 px-4 pr-10 rounded-lg border-2 font-semibold text-xs transition-all appearance-none cursor-pointer bg-gradient-to-br ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:${colors.borderStrong}`}
              >
                {departments.map((dept) => (
                  <option 
                    key={dept} 
                    value={dept}
                    className={`${colors.inputBg} ${colors.inputText} font-semibold`}
                  >
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 ${colors.textAccent} pointer-events-none`} />
            </div>
          )
        ) : (
          <div className={`relative w-full h-11 px-4 rounded-lg border-2 flex items-center overflow-hidden bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <span className={`relative text-xs ${colors.textMuted}`}>N/A for organization logs</span>
          </div>
        )}
      </div>

      {/* Start Date */}
      <div>
        <label className={`block text-xs font-bold ${colors.textMuted} mb-2`}>Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={`w-full h-11 px-4 rounded-lg border-2 font-semibold text-xs transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:${colors.borderStrong}`}
        />
      </div>

      {/* End Date */}
      <div>
        <label className={`block text-xs font-bold ${colors.textMuted} mb-2`}>End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={`w-full h-11 px-4 rounded-lg border-2 font-semibold text-xs transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} focus:${colors.borderStrong}`}
        />
      </div>
    </div>
  );
}