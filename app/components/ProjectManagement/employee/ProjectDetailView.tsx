// app/components/ProjectManagement/employee/ProjectDetailView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  ProjectOverviewTab,
  ProjectDeliverablesTab,
  ProjectMembersTab,
  ProjectAttachmentsTab
} from './ProjectDetailComponents';
import ProjectChatTab from '../depthead/ProjectChatTab'; // Copy from depthead
import {
  FolderKanban,
  Package,
  Users,
  MessageSquare,
  Paperclip
} from 'lucide-react';

interface ProjectDetailViewProps {
  project: any;
  userId: string; // This is username (email)
  userName: string;
  onUpdate: () => void;
}

export default function ProjectDetailView({
  project: initialProject,
  userId,
  userName,
  onUpdate
}: ProjectDetailViewProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  
  // Local project state to prevent page refresh
  const [project, setProject] = useState(initialProject);
  const healthColors = getHealthColors(project.health);

  const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'members' | 'chat' | 'attachments'>('overview');

  // Update local project state when initialProject changes
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  function getHealthColors(health: string) {
    switch (health) {
      case 'healthy':
        return cardCharacters.completed;
      case 'at-risk':
        return cardCharacters.urgent;
      case 'delayed':
        return cardCharacters.urgent;
      case 'critical':
        return cardCharacters.urgent;
      default:
        return cardCharacters.neutral;
    }
  }

  const activeMembers = project.members?.filter((m: any) => !m.leftAt) || [];
  const pendingDeliverables = project.deliverables?.filter((d: any) => d.status !== 'done').length || 0;
  const projectAttachments = project.attachments || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'deliverables', label: 'Deliverables', icon: Package, count: project.deliverables?.length || 0 },
    { id: 'members', label: 'Members', icon: Users, count: activeMembers.length },
    { id: 'chat', label: 'Chat', icon: MessageSquare, count: project.chat?.length || 0 },
    { id: 'attachments', label: 'Attachments', icon: Paperclip, count: projectAttachments.length }
  ];

  // Function to refresh only the current project
  const refreshCurrentProject = async () => {
    try {
      const response = await fetch(
        `/api/ProjectManagement/employee/projects?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      if (data.success && data.projects) {
        const updatedProject = data.projects.find((p: any) => p._id === project._id);
        if (updatedProject) {
          setProject(updatedProject);
        }
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
      showToast('Failed to refresh project data', 'error');
    }
  };

  const getAttachmentUrl = (attachmentPath: string): string => {
    return `/api/download?path=${encodeURIComponent(attachmentPath)}`;
  };

  return (
    <div className="space-y-4">
      {/* Project Header */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${healthColors.bg} ${healthColors.border} ${colors.shadowCard} p-6`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>
        
        <div className="relative space-y-4" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${healthColors.bg}`}>
              <FolderKanban className={`w-8 h-8 ${healthColors.iconColor}`} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h2 className={`text-2xl font-black ${healthColors.text}`}>
                  {project.title}
                </h2>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${healthColors.bg} ${healthColors.text}`}>
                  {project.status.toUpperCase()}
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${healthColors.bg} ${healthColors.text}`}>
                  {project.health.toUpperCase().replace('-', ' ')}
                </div>
                {project.isLead && (
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text}`}>
                    GROUP LEAD
                  </div>
                )}
              </div>
              
              <p className={`text-sm font-bold ${colors.textMuted} mb-2`}>
                {project.projectNumber}
              </p>
              
              <p className={`text-sm ${colors.textSecondary}`}>
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>
        
        <div className="relative px-4 py-3 border-b ${colors.border}" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                      : `${colors.textMuted} hover:${colors.textPrimary}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id 
                        ? `${colors.badgeBg} ${colors.badgeText}` 
                        : `${colors.badge} ${colors.badgeText}`
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          {activeTab === 'overview' && (
            <ProjectOverviewTab
              project={project}
              pendingDeliverables={pendingDeliverables}
            />
          )}

          {activeTab === 'deliverables' && (
            <ProjectDeliverablesTab
              project={project}
              userId={userId}
              userName={userName}
              onUpdate={refreshCurrentProject}
            />
          )}

          {activeTab === 'members' && (
            <ProjectMembersTab
              activeMembers={activeMembers}
              healthColors={healthColors}
            />
          )}

          {activeTab === 'chat' && (
            <ProjectChatTab
              project={project}
              userId={userId}
              userName={userName}
              onUpdate={refreshCurrentProject}
            />
          )}

          {activeTab === 'attachments' && (
            <ProjectAttachmentsTab
              projectAttachments={projectAttachments}
              getAttachmentUrl={getAttachmentUrl}
              healthColors={healthColors}
            />
          )}
        </div>
      </div>
    </div>
  );
}