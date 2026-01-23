// ============================================
// UPDATED: app/components/universal/WorkflowComponents/FunctionalityCard.tsx
// Added isActive toggle functionality
// ============================================

import React, { useState } from 'react';
import { Calendar, Edit2, Trash2, Workflow, Power } from 'lucide-react';
import { Functionality } from './types';
import { useTheme } from '@/app/context/ThemeContext';

interface Props {
  functionality: Functionality;
  onEdit: (func: Functionality) => void;
  onDelete: () => void;
  onToggleActive: (id: string, newStatus: boolean) => void;
}

export default function FunctionalityCard({ functionality, onEdit, onDelete, onToggleActive }: Props) {
  const { colors, cardCharacters, showToast } = useTheme();
  const [isToggling, setIsToggling] = useState(false);
  
  // Use neutral character for inactive, informative for active
  const charColors = functionality.isActive 
    ? cardCharacters.informative 
    : cardCharacters.neutral;

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    
    try {
      const response = await fetch(`/api/functionalities/${functionality._id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) throw new Error('Failed to toggle status');

      const data = await response.json();
      onToggleActive(functionality._id, data.isActive);
      
      showToast(
        data.isActive 
          ? `"${functionality.name}" is now active and visible to users` 
          : `"${functionality.name}" is now inactive and hidden from users`,
        data.isActive ? 'success' : 'warning'
      );
    } catch (error) {
      console.error('Error toggling functionality:', error);
      showToast('Failed to toggle functionality status', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className={`relative group overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300 hover:${colors.shadowHover} ${!functionality.isActive ? 'opacity-75' : ''}`}>
      {/* Paper texture overlay */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      {/* Inactive Badge */}
      {!functionality.isActive && (
        <div className="absolute top-3 right-3 z-10">
          <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${cardCharacters.neutral.border} ${cardCharacters.neutral.bg} ${cardCharacters.neutral.text} backdrop-blur-sm`}>
            Inactive
          </div>
        </div>
      )}
      
      {/* Content with relative positioning */}
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className={`text-xl font-black ${charColors.text} mb-2`}>
            {functionality.name}
          </h3>
          <p className={`${colors.textSecondary} text-sm line-clamp-2`}>
            {functionality.description || 'No description provided'}
          </p>
        </div>

        {/* Workflow Stats */}
        <div className={`relative overflow-hidden flex items-center space-x-4 py-3 px-4 rounded-lg border ${charColors.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
          <div className={`relative p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
            <Workflow className={`w-5 h-5 ${charColors.iconColor}`} />
          </div>
          <div className="relative">
            <p className={`${charColors.text} text-sm font-bold`}>
              {functionality.workflow.nodes.length - 2} Employee Nodes
            </p>
            <p className={`${colors.textSecondary} text-xs`}>
              {functionality.workflow.edges.length} Connections
            </p>
          </div>
        </div>

        {/* Timestamps */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${colors.textMuted}`} />
            <p className={`${colors.textSecondary} text-xs`}>
              Created: {new Date(functionality.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className={`w-4 h-4 ${colors.textMuted}`} />
            <p className={`${colors.textSecondary} text-xs`}>
              Modified: {new Date(functionality.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          {/* Toggle Active/Inactive Button */}
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`group/btn relative overflow-hidden rounded-lg px-4 py-2.5 font-bold text-sm transition-all duration-300 border-2 flex items-center justify-center gap-2 ${
              functionality.isActive
                ? `${cardCharacters.completed.border} ${cardCharacters.completed.text}`
                : `${cardCharacters.urgent.border} ${cardCharacters.urgent.text}`
            } disabled:opacity-50`}
            title={functionality.isActive ? 'Deactivate (hide from users)' : 'Activate (show to users)'}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
              style={{ 
                boxShadow: functionality.isActive
                  ? `inset 0 0 20px ${colors.glowSuccess}`
                  : `inset 0 0 20px rgba(244, 67, 54, 0.15)`
              }}
            ></div>
            <Power 
              className={`w-4 h-4 relative z-10 transition-transform duration-300 ${
                isToggling ? 'animate-spin' : 'group-hover/btn:scale-110'
              } ${functionality.isActive ? cardCharacters.completed.iconColor : cardCharacters.urgent.iconColor}`}
            />
          </button>

          {/* Edit Button */}
          <button
            onClick={() => onEdit(functionality)}
            className={`group/btn relative flex-1 overflow-hidden rounded-lg px-4 py-2.5 font-bold text-sm transition-all duration-300 border-2 ${charColors.border} ${charColors.text} flex items-center justify-center gap-2`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
            ></div>
            <Edit2 className={`w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:rotate-12 ${charColors.iconColor}`} />
            <span className="relative z-10">Edit</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className={`group/btn relative overflow-hidden rounded-lg px-4 py-2.5 font-bold text-sm transition-all duration-300 border-2 ${cardCharacters.urgent.border} ${cardCharacters.urgent.text} flex items-center justify-center`}
          >
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
            <div 
              className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 20px rgba(244, 67, 54, 0.15)` }}
            ></div>
            <Trash2 className={`w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:scale-110 ${cardCharacters.urgent.iconColor}`} />
          </button>
        </div>
      </div>
    </div>
  );
}