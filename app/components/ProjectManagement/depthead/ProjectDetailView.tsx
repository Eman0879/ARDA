// app/components/ProjectManagement/depthead/ProjectDetailView.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  ProjectOverviewTab,
  ProjectDeliverablesTab,
  ProjectMembersTab,
  ProjectAttachmentsTab
} from './ProjectDetailComponents';
import ProjectChatTab from './ProjectChatTab';
import {
  FolderKanban,
  Package,
  Users,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import CreateDeliverableModal from './CreateDeliverableModal';

interface Employee {
  _id: string;
  username: string;
  'basicDetails.name': string;
  title: string;
  department?: string;
}

interface ProjectDetailViewProps {
  project: any;
  userId: string;
  userName: string;
  department: string;
  onUpdate: () => void;
}

export default function ProjectDetailView({
  project: initialProject,
  userId,
  userName,
  department,
  onUpdate
}: ProjectDetailViewProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  
  // Local project state to prevent page refresh
  const [project, setProject] = useState(initialProject);
  const healthColors = getHealthColors(project.health);

  const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'members' | 'chat' | 'attachments'>('overview');
  const [showCreateDeliverable, setShowCreateDeliverable] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Update local project state when initialProject changes
  useEffect(() => {
    setProject(initialProject);
  }, [initialProject]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);

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
        `/api/ProjectManagement/depthead/projects/${project._id}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      if (data.success && data.project) {
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error refreshing project:', error);
      showToast('Failed to refresh project data', 'error');
    }
  };

  const fetchEmployees = async () => {
    try {
      setFetchingEmployees(true);
      const response = await fetch(`/api/dept-employees?department=${encodeURIComponent(department)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch employees');
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.employees)) {
        const activeMemberIds = activeMembers.map((m: any) => m.userId);
        const availableEmployees = data.employees.filter(
          (emp: Employee) => !activeMemberIds.includes(emp._id)
        );
        setEmployees(availableEmployees);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      showToast('Failed to fetch employees', 'error');
      setEmployees([]);
    } finally {
      setFetchingEmployees(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (!employeeSearch) return true;
    const searchLower = employeeSearch.toLowerCase();
    const name = (emp['basicDetails.name'] || emp.username || '').toLowerCase();
    const title = (emp.title || '').toLowerCase();
    return name.includes(searchLower) || title.includes(searchLower);
  });

  const handleStatusAction = async (action: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/ProjectManagement/depthead/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId, userName })
      });

      if (!response.ok) throw new Error('Failed to update project');
      
      const actionLabel = action === 'complete' ? 'completed' : action === 'archive' ? 'archived' : 'reopened';
      showToast(`Project ${actionLabel} successfully`, 'success');
      
      // Refresh current project instead of full page
      await refreshCurrentProject();
    } catch (error) {
      showToast(`Failed to ${action} project`, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    const employee = employees.find(e => e._id === selectedEmployee);
    if (!employee) return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/ProjectManagement/depthead/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-member',
          userId,
          userName,
          member: {
            userId: employee._id,
            name: employee['basicDetails.name'] || employee.username,
            role: 'member'
          }
        })
      });

      if (!response.ok) throw new Error('Failed to add member');
      
      showToast('Member added successfully', 'success');
      setSelectedEmployee('');
      setEmployeeSearch('');
      setShowAddMember(false);
      setEmployees([]);
      
      // Refresh current project instead of full page
      await refreshCurrentProject();
    } catch (error) {
      showToast('Failed to add member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(`/api/ProjectManagement/depthead/projects/${project._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove-member',
          userId,
          userName,
          memberId
        })
      });

      if (!response.ok) throw new Error('Failed to remove member');
      
      showToast('Member removed successfully', 'success');
      
      // Refresh current project instead of full page
      await refreshCurrentProject();
    } catch (error) {
      showToast('Failed to remove member', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getAttachmentUrl = (attachmentPath: string): string => {
    // Use the download API with the full path
    return `/api/download?path=${encodeURIComponent(attachmentPath)}`;
  };

  return (
    <>
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
                onStatusAction={handleStatusAction}
                actionLoading={actionLoading}
              />
            )}

            {activeTab === 'deliverables' && (
              <ProjectDeliverablesTab
                project={project}
                userId={userId}
                userName={userName}
                department={department}
                onUpdate={refreshCurrentProject}
                onCreateDeliverable={() => {
                  setShowCreateDeliverable(true);
                }}
              />
            )}

            {activeTab === 'members' && (
              <ProjectMembersTab
                project={project}
                department={department}
                activeMembers={activeMembers}
                showAddMember={showAddMember}
                setShowAddMember={setShowAddMember}
                employees={employees}
                fetchingEmployees={fetchingEmployees}
                employeeSearch={employeeSearch}
                setEmployeeSearch={setEmployeeSearch}
                filteredEmployees={filteredEmployees}
                selectedEmployee={selectedEmployee}
                setSelectedEmployee={setSelectedEmployee}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                onFetchEmployees={fetchEmployees}
                actionLoading={actionLoading}
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

      {/* Create Deliverable Modal */}
      {showCreateDeliverable && (
        <CreateDeliverableModal
          project={project}
          userId={userId}
          userName={userName}
          onClose={() => {
            setShowCreateDeliverable(false);
          }}
          onSuccess={async () => {
            setShowCreateDeliverable(false);
            showToast('Deliverable created successfully', 'success');
            await refreshCurrentProject();
          }}
        />
      )}
    </>
  );
}