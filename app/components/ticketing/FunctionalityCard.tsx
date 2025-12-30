// ============================================
// app/components/ticketing/FunctionalityCard.tsx
// Card displaying functionality info for ticket creation
// ============================================

import React from 'react';
import { Workflow, ChevronRight, FileText } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Functionality {
  _id: string;
  name: string;
  description: string;
  department: string;
  formSchema?: {
    fields: any[];
    useDefaultFields: boolean;
  };
}

interface Props {
  functionality: Functionality;
  onClick: () => void;
}

export default function FunctionalityCard({ functionality, onClick }: Props) {
  const { colors, cardCharacters } = useTheme();
  
  // Map departments to card characters
  const getDepartmentCharacter = (dept: string) => {
    switch (dept) {
      case 'IT':
        return cardCharacters.informative;
      case 'HR':
        return cardCharacters.urgent;
      case 'Finance':
        return cardCharacters.interactive;
      case 'Operations':
        return cardCharacters.completed;
      case 'Marketing':
        return cardCharacters.creative;
      default:
        return cardCharacters.neutral;
    }
  };

  const charColors = getDepartmentCharacter(functionality.department);
  const fieldCount = functionality.formSchema?.fields?.length || 0;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} hover:${colors.shadowHover} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
    >
      {/* Paper Texture */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      {/* Internal Glow on Hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
      ></div>

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div 
            className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-r ${charColors.bg}`}
          >
            <Workflow className={`w-7 h-7 transition-transform duration-500 group-hover:rotate-12 ${charColors.iconColor}`} />
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:translate-x-1 bg-gradient-to-r ${charColors.bg}`}>
            <span className={`text-xs font-bold ${charColors.accent}`}>
              View Details
            </span>
            <ChevronRight 
              className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${charColors.iconColor}`}
            />
          </div>
        </div>

        {/* Content */}
        <h3 className={`text-xl font-black ${charColors.text} line-clamp-2 group-hover:${charColors.accent} transition-colors duration-300`}>
          {functionality.name}
        </h3>
        
        <p className={`text-sm ${colors.textSecondary} line-clamp-3 min-h-[3.5rem] leading-relaxed`}>
          {functionality.description || 'No description provided'}
        </p>

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 border-t ${charColors.border} transition-colors duration-300`}>
          <div className="flex items-center gap-2">
            <div 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 group-hover:scale-105 bg-gradient-to-r ${charColors.bg} ${charColors.text}`}
            >
              {functionality.department}
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${colors.inputBg} ${colors.inputBorder} border`}>
            <FileText className={`w-3.5 h-3.5 ${colors.textMuted}`} />
            <span className={`text-xs font-semibold ${colors.textSecondary}`}>
              {fieldCount} field{fieldCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}