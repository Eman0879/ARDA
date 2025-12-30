// ============================================
// FILE 3: GroupDragItem.tsx
// ============================================

import React from 'react';
import { Users } from 'lucide-react';
import { Employee } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface Props { 
  groupLead: Employee; 
  members: Employee[]; 
}

export default function GroupDragItem({ groupLead, members }: Props) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.creative; // Purple for parallel groups

  return (
    <div 
      draggable 
      onDragStart={(e) => e.dataTransfer.setData('application/json', JSON.stringify({ 
        isGroup: true, 
        groupLead: groupLead._id, 
        groupMembers: members.map(m => m._id) 
      }))}
      className={`group relative overflow-hidden p-3 rounded-lg border cursor-move transition-all duration-200 hover:scale-[1.02] bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard}`}
    >
      {/* Paper texture */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
      
      {/* Hover glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 0 0 20px rgba(138, 43, 226, 0.15)` }}
      ></div>
      
      {/* Content */}
      <div className="relative space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 pb-2 border-b" style={{ borderColor: charColors.border.replace('border-', '') }}>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-r ${charColors.bg}`}>
            <Users className={`w-4 h-4 ${charColors.iconColor}`} />
          </div>
          <p className={`text-[10px] font-bold uppercase tracking-wide ${charColors.accent}`}>
            Parallel Group
          </p>
        </div>
        
        {/* Group Lead */}
        <div>
          <p className={`text-[9px] font-bold ${colors.textMuted} mb-1`}>Lead:</p>
          <div className="flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" 
              style={{ background: `linear-gradient(135deg, ${charColors.iconColor.replace('text-', '')}, ${charColors.accent.replace('text-', '')})` }}
            >
              {groupLead.basicDetails.name.charAt(0)}
            </div>
            <p className={`text-[10px] font-bold ${charColors.text} truncate`}>
              {groupLead.basicDetails.name}
            </p>
          </div>
        </div>
        
        {/* Members */}
        <div>
          <p className={`text-[9px] font-bold ${colors.textMuted} mb-1`}>
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
          <div className="flex flex-wrap gap-1">
            {members.slice(0, 4).map(m => (
              <div 
                key={m._id} 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold" 
                style={{ background: `linear-gradient(135deg, ${charColors.iconColor.replace('text-', '')}, ${charColors.accent.replace('text-', '')})` }}
                title={m.basicDetails.name}
              >
                {m.basicDetails.name.charAt(0)}
              </div>
            ))}
            {members.length > 4 && (
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[8px] font-bold`}
                style={{ background: colors.textMuted.replace('text-', '') }}
              >
                +{members.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}