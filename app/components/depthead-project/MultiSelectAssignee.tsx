// app/components/depthead-project/MultiSelectAssignee.tsx
'use client';

import { useTheme } from '@/app/context/ThemeContext';
import { Users } from 'lucide-react';

interface TeamMember {
  username: string;
  displayName: string;
  email: string;
}

interface MultiSelectAssigneeProps {
  teamMembers: TeamMember[];
  selectedAssignees: string[];
  onChange: (assignees: string[]) => void;
  label?: string;
  required?: boolean;
  allowEmpty?: boolean;
}

export default function MultiSelectAssignee({
  teamMembers,
  selectedAssignees,
  onChange,
  label = 'Assign To (Select Multiple)',
  required = true,
  allowEmpty = false
}: MultiSelectAssigneeProps) {
  const { colors, cardCharacters } = useTheme();

  const toggleAssignee = (employeeId: string) => {
    if (selectedAssignees.includes(employeeId)) {
      const newSelection = selectedAssignees.filter(id => id !== employeeId);
      if (newSelection.length === 0 && !allowEmpty) {
        return;
      }
      onChange(newSelection);
    } else {
      onChange([...selectedAssignees, employeeId]);
    }
  };

  return (
    <div className="space-y-2">
      <label className={`flex items-center gap-2 font-semibold ${colors.textPrimary}`}>
        <Users className="w-4 h-4" />
        {label} {required && <span className={colors.textAccent}>*</span>}
      </label>
      
      <div className={`relative border rounded-xl p-3 max-h-64 overflow-y-auto backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] rounded-xl`}></div>
        
        <div className="relative">
          {teamMembers.length === 0 ? (
            <div className={`text-sm text-center py-4 ${colors.textMuted}`}>
              No team members found
            </div>
          ) : (
            teamMembers.map(member => (
              <label
                key={member.username}
                className={`group relative flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all overflow-hidden ${colors.cardBgHover}`}
              >
                {/* Hover Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-0 group-hover:opacity-[0.03] transition-opacity`}></div>
                
                <input
                  type="checkbox"
                  checked={selectedAssignees.includes(member.username)}
                  onChange={() => toggleAssignee(member.username)}
                  className={`relative w-4 h-4 rounded focus:ring-2 focus:ring-opacity-50 cursor-pointer ${colors.inputBorder}`}
                  style={{
                    accentColor: 'var(--tw-gradient-from, #2196F3)'
                  }}
                />
                <div className="relative flex-1">
                  <div className={`font-medium ${colors.textPrimary}`}>
                    {member.displayName}
                  </div>
                  <div className={`text-xs ${colors.textMuted}`}>
                    {member.email}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>
      
      {selectedAssignees.length > 0 && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.text} ${cardCharacters.informative.border}`}>
          <Users className="w-4 h-4" />
          <span>
            {selectedAssignees.length} member{selectedAssignees.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
      
      {!allowEmpty && selectedAssignees.length === 0 && (
        <p className={`text-xs ${colors.textMuted}`}>
          At least one assignee is required
        </p>
      )}
    </div>
  );
}