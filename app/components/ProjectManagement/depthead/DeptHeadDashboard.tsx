// app/components/ProjectManagement/depthead/DeptHeadDashboard.tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  FolderKanban,
  Zap,
  Plus
} from 'lucide-react';
import ProjectsView from './ProjectsView';
import SprintsView from './SprintsView';
import CreateProjectModal from './CreateProjectModal';
import CreateSprintModal from './CreateSprintModal';

interface DeptHeadDashboardProps {
  userId: string;
  userName: string;
  department: string;
}

type ContentType = 'projects' | 'sprints';

export default function DeptHeadDashboard({ userId, userName, department }: DeptHeadDashboardProps) {
  const { colors, cardCharacters } = useTheme();

  const [contentType, setContentType] = useState<ContentType>('projects');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modals
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateSprint, setShowCreateSprint] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreateClick = () => {
    if (contentType === 'projects') {
      setShowCreateProject(true);
    } else {
      setShowCreateSprint(true);
    }
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
                  {department} Department
                </h2>
                <p className={`text-sm ${colors.textMuted}`}>
                  Project & Sprint Management
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateClick}
              className={`group relative px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} hover:scale-105`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
              ></div>
              <Plus className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
              <span className="relative z-10">Create {contentType === 'projects' ? 'Project' : 'Sprint'}</span>
            </button>
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
          department={department}
          userId={userId}
          userName={userName}
          onRefresh={handleRefresh}
        />
      ) : (
        <SprintsView
          key={`sprints-${refreshTrigger}`}
          department={department}
          userId={userId}
          userName={userName}
          onRefresh={handleRefresh}
        />
      )}

      {/* Create Modals */}
      {showCreateProject && (
        <CreateProjectModal
          department={department}
          userId={userId}
          userName={userName}
          onClose={() => setShowCreateProject(false)}
          onSuccess={() => {
            setShowCreateProject(false);
            handleRefresh();
          }}
        />
      )}

      {showCreateSprint && (
        <CreateSprintModal
          department={department}
          userId={userId}
          userName={userName}
          onClose={() => setShowCreateSprint(false)}
          onSuccess={() => {
            setShowCreateSprint(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}