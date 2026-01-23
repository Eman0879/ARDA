// app/components/ProjectManagement/employee/EmployeeProjectsDashboard.tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  FolderKanban,
  Zap
} from 'lucide-react';
import ProjectsView from './ProjectsView';
import SprintsView from './SprintsView';

interface EmployeeProjectsDashboardProps {
  userId: string; // This is username (email)
  userName: string;
}

type ContentType = 'projects' | 'sprints';

export default function EmployeeProjectsDashboard({ userId, userName }: EmployeeProjectsDashboardProps) {
  const { colors, cardCharacters } = useTheme();

  const [contentType, setContentType] = useState<ContentType>('projects');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${colors.shadowCard}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${cardCharacters.informative.bg}`}>
                {contentType === 'projects' ? (
                  <FolderKanban className={`w-6 h-6 ${cardCharacters.informative.iconColor}`} />
                ) : (
                  <Zap className={`w-6 h-6 ${cardCharacters.informative.iconColor}`} />
                )}
              </div>
              <div>
                <h2 className={`text-2xl font-black ${cardCharacters.informative.text}`}>
                  My Work
                </h2>
                <p className={`text-sm ${colors.textMuted}`}>
                  Projects & Sprints
                </p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setContentType('projects')}
              className={`group relative flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                contentType === 'projects'
                  ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                  : `${colors.inputBg} ${colors.textSecondary} hover:bg-opacity-60`
              }`}
            >
              {contentType === 'projects' && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                ></div>
              )}
              <FolderKanban className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Projects</span>
            </button>
            
            <button
              onClick={() => setContentType('sprints')}
              className={`group relative flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                contentType === 'sprints'
                  ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                  : `${colors.inputBg} ${colors.textSecondary} hover:bg-opacity-60`
              }`}
            >
              {contentType === 'sprints' && (
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                ></div>
              )}
              <Zap className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Sprints</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {contentType === 'projects' ? (
        <ProjectsView
          key={`projects-${refreshTrigger}`}
          userId={userId}
          userName={userName}
          onRefresh={handleRefresh}
        />
      ) : (
        <SprintsView
          key={`sprints-${refreshTrigger}`}
          userId={userId}
          userName={userName}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}