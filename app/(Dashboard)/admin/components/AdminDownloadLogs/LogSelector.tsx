// app/(Dashboard)/admin/components/AdminDownloadLogs/LogSelector.tsx
'use client';

import React from 'react';
import { Globe, Building2, ChevronDown, Loader2 } from 'lucide-react';

interface LogSelectorProps {
  selectedType: 'org' | 'dept';
  onTypeChange: (type: 'org' | 'dept') => void;
  departments: string[];
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  loadingDepartments: boolean;
}

export default function LogSelector({
  selectedType,
  onTypeChange,
  departments,
  selectedDepartment,
  onDepartmentChange,
  loadingDepartments
}: LogSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <div>
        <label className="block text-sm font-bold text-white mb-3">Select Log Type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onTypeChange('org')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedType === 'org'
                ? 'bg-gradient-to-br from-[#FF0000]/30 to-[#DC143C]/20 border-[#FF0000] shadow-lg shadow-[#FF0000]/30'
                : 'bg-gray-800/40 border-gray-700 hover:border-[#FF0000]/60 hover:bg-gray-800/60'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Globe className={`h-12 w-12 ${selectedType === 'org' ? 'text-[#FF0000]' : 'text-gray-400'}`} />
              <div className="text-center">
                <div className={`font-black text-lg ${selectedType === 'org' ? 'text-white' : 'text-gray-300'}`}>
                  Organization Announcements
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  All company-wide announcements
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => onTypeChange('dept')}
            className={`p-6 rounded-xl border-2 transition-all duration-300 ${
              selectedType === 'dept'
                ? 'bg-gradient-to-br from-[#0000FF]/30 to-[#6495ED]/20 border-[#0000FF] shadow-lg shadow-[#0000FF]/30'
                : 'bg-gray-800/40 border-gray-700 hover:border-[#0000FF]/60 hover:bg-gray-800/60'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <Building2 className={`h-12 w-12 ${selectedType === 'dept' ? 'text-[#0000FF]' : 'text-gray-400'}`} />
              <div className="text-center">
                <div className={`font-black text-lg ${selectedType === 'dept' ? 'text-white' : 'text-gray-300'}`}>
                  Department Announcements
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Specific department logs
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Department Selection */}
      {selectedType === 'dept' && (
        <div>
          <label className="block text-sm font-bold text-white mb-3">Select Department</label>
          {loadingDepartments ? (
            <div className="w-full px-4 py-3 bg-gray-800/60 border-2 border-[#0000FF]/40 rounded-xl flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-[#87CEEB] animate-spin" />
              <span className="text-[#87CEEB] font-semibold">Loading departments...</span>
            </div>
          ) : departments.length === 0 ? (
            <div className="w-full px-4 py-3 bg-red-500/10 border-2 border-red-500/30 rounded-xl">
              <p className="text-red-400 font-semibold">No departments found in database</p>
            </div>
          ) : (
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => onDepartmentChange(e.target.value)}
                className="w-full px-4 py-3 bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-[#0000FF]/40 rounded-xl text-white font-bold focus:outline-none focus:border-[#0000FF] focus:shadow-lg focus:shadow-[#0000FF]/20 transition-all appearance-none cursor-pointer hover:border-[#87CEEB]/60"
                style={{ backgroundImage: 'none' }}
              >
                {departments.map((dept) => (
                  <option 
                    key={dept} 
                    value={dept}
                    className="bg-gray-900 text-white font-semibold py-2"
                  >
                    {dept}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#87CEEB] pointer-events-none" />
            </div>
          )}
          
          {departments.length > 0 && (
            <p className="text-xs text-gray-400 mt-2 font-semibold">
              {departments.length} department{departments.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      )}
    </div>
  );
}