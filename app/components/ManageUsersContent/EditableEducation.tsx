// app/components/ManageUsersContent/EditableEducation.tsx
'use client';

import React from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface EducationEntry {
  title: string;
  degree: string;
  institute: string;
  specialization: string;
  percentage: string;
}

interface EditableEducationProps {
  education: EducationEntry[];
  onUpdate: (index: number, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function EditableEducation({ education, onUpdate, onAdd, onRemove }: EditableEducationProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.creative;

  return (
    <div className={`relative overflow-hidden rounded-xl p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${charColors.border}`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
              <GraduationCap className={`h-4 w-4 ${charColors.iconColor}`} />
            </div>
            <h3 className={`text-base font-black ${colors.textPrimary}`}>Educational Details</h3>
          </div>
          <button
            onClick={onAdd}
            className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all duration-300 hover:scale-105 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent`}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
            ></div>
            <Plus className="h-3.5 w-3.5 relative z-10" />
            <span className="relative z-10">Add Education</span>
          </button>
        </div>

        {education.length === 0 ? (
          <div className="text-center py-8">
            <GraduationCap className={`h-10 w-10 ${colors.textMuted} mx-auto mb-3 opacity-40`} />
            <p className={`${colors.textMuted} text-sm font-semibold mb-1`}>No education records added</p>
            <p className={`${colors.textMuted} text-xs`}>Click "Add Education" to add records</p>
          </div>
        ) : (
          <div className="space-y-3">
            {education.map((edu, index) => (
              <div key={index} className={`relative overflow-hidden rounded-lg p-4 border-2 bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-sm font-bold ${colors.textPrimary}`}>Education #{index + 1}</h4>
                    <button
                      onClick={() => onRemove(index)}
                      className={`group relative p-2 rounded-lg transition-all hover:scale-105 overflow-hidden bg-gradient-to-r ${cardCharacters.urgent.bg} border ${cardCharacters.urgent.border}`}
                      title="Remove Education"
                    >
                      <Trash2 className={`h-3.5 w-3.5 relative z-10 ${cardCharacters.urgent.iconColor}`} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                        Title
                      </label>
                      <input
                        type="text"
                        value={edu.title || ''}
                        onChange={(e) => onUpdate(index, 'title', e.target.value)}
                        placeholder="e.g., Bachelor's, Master's"
                        className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => onUpdate(index, 'degree', e.target.value)}
                        placeholder="e.g., BS, MS, PhD"
                        className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                        Institute
                      </label>
                      <input
                        type="text"
                        value={edu.institute || ''}
                        onChange={(e) => onUpdate(index, 'institute', e.target.value)}
                        placeholder="Institution name"
                        className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                        Specialization
                      </label>
                      <input
                        type="text"
                        value={edu.specialization || ''}
                        onChange={(e) => onUpdate(index, 'specialization', e.target.value)}
                        placeholder="Field of study"
                        className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-bold ${colors.textAccent} uppercase tracking-wide mb-1.5 block`}>
                        Percentage / CGPA
                      </label>
                      <input
                        type="text"
                        value={edu.percentage || ''}
                        onChange={(e) => onUpdate(index, 'percentage', e.target.value)}
                        placeholder="Grade or percentage"
                        className={`w-full px-3 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:${colors.borderStrong}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}