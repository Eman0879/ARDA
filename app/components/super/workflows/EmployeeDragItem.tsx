// ============================================
// app/components/super/workflows/EmployeeDragItem.tsx
// Drag item for individual employees - safe for new API structure
// ============================================

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';

interface Employee {
  _id: string;
  basicDetails?: {
    name?: string;
    profileImage?: string;
  };
  name?: string;
  username?: string;
  title?: string;
  department?: string;
}

interface Props { 
  employee: Employee; 
}

export default function SuperEmployeeDragItem({ employee }: Props) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;

  // Helper functions for safe data access
  const getEmployeeName = (emp: Employee): string => {
    return emp.name || emp.basicDetails?.name || emp.username || 'Unknown';
  };

  const getEmployeeTitle = (emp: Employee): string => {
    return emp.title || 'No Title';
  };

  const getEmployeeInitial = (emp: Employee): string => {
    const name = getEmployeeName(emp);
    return name.charAt(0).toUpperCase();
  };

  const empName = getEmployeeName(employee);
  const empTitle = getEmployeeTitle(employee);
  const empInitial = getEmployeeInitial(employee);

  return (
    <div 
      draggable 
      onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify(employee))}
      className={`group relative overflow-hidden p-2.5 rounded-lg border cursor-move transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}
    >
      {/* Paper texture */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
      
      {/* Hover glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
      ></div>
      
      {/* Content */}
      <div className="relative flex items-center gap-2">
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${colors.shadowCard} flex-shrink-0`} 
          style={{ background: `linear-gradient(135deg, ${charColors.iconColor.replace('text-', '')}, ${charColors.accent.replace('text-', '')})` }}
        >
          {empInitial}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`${charColors.text} font-bold text-xs truncate`}>
            {empName}
          </p>
          <p className={`${colors.textSecondary} text-[10px] truncate`}>
            {empTitle}
          </p>
        </div>
      </div>
    </div>
  );
}