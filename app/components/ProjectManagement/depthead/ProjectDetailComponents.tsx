// app/components/ProjectManagement/depthead/ProjectDetailComponents.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  Package,
  MessageSquare,
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Send,
  Loader2,
  CheckCircle,
  Archive,
  RotateCcw,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Plus
} from 'lucide-react';
import DeliverableCard from './DeliverableCard';

interface Employee {
  _id: string;
  username: string;
  'basicDetails.name': string;
  title: string;
  department?: string;
}

interface Attachment {
  name: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: {
    userId: string;
    name: string;
  };
}

// Overview Tab Component
export function ProjectOverviewTab({
  project,
  pendingDeliverables,
  onStatusAction,
  actionLoading
}: {
  project: any;
  pendingDeliverables: number;
  onStatusAction: (action: string) => void;
  actionLoading: boolean;
}) {
  const { colors, cardCharacters } = useTheme();

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
        <h3 className={`text-sm font-bold ${colors.textPrimary} mb-2`}>Description</h3>
        <p className={`text-sm ${colors.textSecondary}`}>{project.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>STATUS</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {project.status.toUpperCase()}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>HEALTH</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {project.health.toUpperCase().replace('-', ' ')}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>DELIVERABLES</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {pendingDeliverables} Pending
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {project.status === 'active' && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusAction('complete');
              }}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text} disabled:opacity-50`}
            >
              <CheckCircle className="w-4 h-4" />
              Complete Project
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusAction('archive');
              }}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 border-2 ${cardCharacters.neutral.border} ${cardCharacters.neutral.text} disabled:opacity-50`}
            >
              <Archive className="w-4 h-4" />
              Archive
            </button>
          </>
        )}
        {(project.status === 'completed' || project.status === 'archived') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusAction('reopen');
            }}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.text} disabled:opacity-50`}
          >
            <RotateCcw className="w-4 h-4" />
            Reopen Project
          </button>
        )}
      </div>
    </div>
  );
}

// Deliverables Tab Component
export function ProjectDeliverablesTab({
  project,
  userId,
  userName,
  department,
  onUpdate,
  onCreateDeliverable
}: {
  project: any;
  userId: string;
  userName: string;
  department: string;
  onUpdate: () => void;
  onCreateDeliverable: () => void;
}) {
  const { colors } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-black ${colors.textPrimary}`}>
          Deliverables ({project.deliverables?.length || 0})
        </h3>
        <button
          type="button"
          onClick={(e) => {
            console.log('🔵 Button clicked - raw event');
            e.preventDefault();
            e.stopPropagation();
            console.log('🔵 After preventDefault and stopPropagation');
            console.log('🔵 Calling onCreateDeliverable...');
            onCreateDeliverable();
            console.log('🔵 onCreateDeliverable called successfully');
          }}
          onMouseDown={(e) => console.log('🔵 Mouse down on button')}
          onMouseUp={(e) => console.log('🔵 Mouse up on button')}
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} hover:scale-105`}
        >
          <Plus className="w-4 h-4" />
          Add Deliverable
        </button>
      </div>

      {project.deliverables?.length === 0 ? (
        <div className={`p-12 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <Package className={`w-12 h-12 mx-auto mb-3 ${colors.textMuted} opacity-40`} />
          <p className={`${colors.textPrimary} font-bold mb-2`}>No deliverables yet</p>
          <p className={`${colors.textSecondary} text-sm`}>
            Create your first deliverable to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {project.deliverables.map((deliverable: any) => (
            <DeliverableCard
              key={deliverable._id}
              deliverable={deliverable}
              projectId={project._id}
              userId={userId}
              userName={userName}
              department={department}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Members Tab Component
export function ProjectMembersTab({
  project,
  department,
  activeMembers,
  showAddMember,
  setShowAddMember,
  employees,
  fetchingEmployees,
  employeeSearch,
  setEmployeeSearch,
  filteredEmployees,
  selectedEmployee,
  setSelectedEmployee,
  onAddMember,
  onRemoveMember,
  onFetchEmployees,
  actionLoading
}: {
  project: any;
  department: string;
  activeMembers: any[];
  showAddMember: boolean;
  setShowAddMember: (show: boolean) => void;
  employees: Employee[];
  fetchingEmployees: boolean;
  employeeSearch: string;
  setEmployeeSearch: (search: string) => void;
  filteredEmployees: Employee[];
  selectedEmployee: string;
  setSelectedEmployee: (id: string) => void;
  onAddMember: (e: React.FormEvent) => void;
  onRemoveMember: (memberId: string) => void;
  onFetchEmployees: () => void;
  actionLoading: boolean;
}) {
  const { colors, cardCharacters } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-black ${colors.textPrimary}`}>
          Team Members ({activeMembers.length})
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddMember(!showAddMember);
            if (!showAddMember && employees.length === 0) {
              onFetchEmployees();
            }
          }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {showAddMember && (
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border} space-y-3`}>
          <h4 className={`text-sm font-bold ${colors.textPrimary}`}>Select Employee to Add</h4>
          
          {fetchingEmployees ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className={`w-6 h-6 animate-spin ${colors.textMuted}`} />
            </div>
          ) : employees.length === 0 ? (
            <div className={`p-4 text-center`}>
              <p className={`text-sm ${colors.textMuted}`}>No available employees to add</p>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="Search employees by name or title..."
                onClick={(e) => e.stopPropagation()}
                className={`w-full px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
              />
              
              <div className={`rounded-lg border ${colors.border} max-h-64 overflow-y-auto`}>
                {filteredEmployees.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className={`text-sm ${colors.textMuted}`}>No employees match your search</p>
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <div
                      key={employee._id}
                      className={`flex items-center justify-between p-3 border-b last:border-b-0 ${colors.borderSubtle} ${
                        selectedEmployee === employee._id
                          ? `bg-gradient-to-r ${cardCharacters.informative.bg}`
                          : `${colors.cardBg} hover:${colors.cardBgHover}`
                      } transition-all cursor-pointer`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(employee._id);
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            selectedEmployee === employee._id
                              ? `${cardCharacters.informative.border} ${cardCharacters.informative.bg}`
                              : colors.border
                          }`}
                        >
                          {selectedEmployee === employee._id && (
                            <CheckCircle className={`w-3.5 h-3.5 ${cardCharacters.informative.iconColor}`} />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${colors.textPrimary}`}>
                            {employee['basicDetails.name'] || employee.username}
                          </p>
                          <p className={`text-xs ${colors.textMuted}`}>{employee.title || 'Employee'}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddMember(e);
                  }}
                  disabled={!selectedEmployee || actionLoading}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm transition-colors bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add Member'}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddMember(false);
                    setSelectedEmployee('');
                    setEmployeeSearch('');
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${colors.buttonGhost} ${colors.buttonGhostText}`}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        {activeMembers.map((member: any) => (
          <div
            key={member.userId}
            className={`flex items-center justify-between p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}
          >
            <div>
              <div className="flex items-center gap-2">
                <p className={`font-bold ${colors.textPrimary}`}>{member.name}</p>
                {member.role === 'lead' && (
                  <Crown className={`w-4 h-4 ${cardCharacters.completed.iconColor}`} />
                )}
                {member.department && member.department !== department && (
                  <span className={`text-xs px-2 py-0.5 rounded ${colors.badge} ${colors.badgeText}`}>
                    {member.department}
                  </span>
                )}
              </div>
              <p className={`text-sm ${colors.textMuted}`}>
                {member.role === 'lead' ? 'Group Lead' : member.role === 'dept-head' ? 'Department Head' : 'Member'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs ${colors.textMuted}`}>
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </span>
              {member.role !== 'lead' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveMember(member.userId);
                  }}
                  disabled={actionLoading}
                  className={`p-2 rounded-lg transition-colors ${colors.buttonGhost} ${colors.buttonGhostText} disabled:opacity-50`}
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Chat Tab Component
export function ProjectChatTab({
  project,
  chatMessage,
  setChatMessage,
  onSendMessage,
  actionLoading
}: {
  project: any;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  actionLoading: boolean;
}) {
  const { colors } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-black ${colors.textPrimary}`}>
        Project Chat
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {project.chat?.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
            <MessageSquare className={`w-10 h-10 mx-auto mb-2 ${colors.textMuted} opacity-40`} />
            <p className={`${colors.textMuted} text-sm`}>No messages yet</p>
          </div>
        ) : (
          project.chat?.map((msg: any, index: number) => (
            <div key={index} className={`p-3 rounded-lg ${colors.cardBg}`}>
              <div className="flex justify-between mb-1">
                <span className={`text-sm font-bold ${colors.textPrimary}`}>
                  {msg.userName}
                </span>
                <span className={`text-xs ${colors.textMuted}`}>
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
              <p className={`text-sm ${colors.textSecondary}`}>{msg.message}</p>
            </div>
          ))
        )}
      </div>
      <form 
        onSubmit={(e) => {
          e.stopPropagation();
          onSendMessage(e);
        }}
        className="flex gap-2"
      >
        <input
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Type a message..."
          className={`flex-1 px-4 py-3 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
        />
        <button
          type="submit"
          disabled={!chatMessage.trim() || actionLoading}
          onClick={(e) => e.stopPropagation()}
          className={`p-3 rounded-lg bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50`}
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
}

// Attachments Tab Component
export function ProjectAttachmentsTab({
  projectAttachments,
  getAttachmentUrl,
  healthColors
}: {
  projectAttachments: Attachment[];
  getAttachmentUrl: (path: string) => string;
  healthColors: any;
}) {
  const { colors } = useTheme();

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    if (['pdf'].includes(ext || '')) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-black ${colors.textPrimary} flex items-center gap-2`}>
        <Paperclip className="w-5 h-5" />
        Project Attachments ({projectAttachments.length})
      </h3>

      {projectAttachments.length === 0 ? (
        <div className={`p-12 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <Paperclip className={`w-12 h-12 mx-auto mb-3 ${colors.textMuted} opacity-40`} />
          <p className={`${colors.textPrimary} font-bold mb-2`}>No attachments</p>
          <p className={`${colors.textSecondary} text-sm`}>
            Attachments uploaded with this project will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projectAttachments.map((attachment: Attachment, index: number) => {
            const fileUrl = getAttachmentUrl(attachment.path);
            
            return (
              <a
                key={index}
                href={fileUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`
                  group/file relative flex items-center gap-4 p-4 rounded-xl border-2 
                  transition-all duration-300 overflow-hidden
                  ${colors.cardBg} ${colors.border}
                  hover:shadow-lg
                `}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                
                <div 
                  className="absolute inset-0 opacity-0 group-hover/file:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
                ></div>
                
                <div className={`relative z-10 p-3 rounded-lg bg-gradient-to-r ${healthColors.bg} ${healthColors.iconColor} flex-shrink-0`}>
                  {getFileIcon(attachment.name)}
                </div>
                
                <div className="relative z-10 flex-1 min-w-0">
                  <p className={`text-sm font-bold ${colors.textPrimary} truncate`}>
                    {attachment.name}
                  </p>
                  <div className={`flex items-center gap-3 mt-1 text-xs ${colors.textMuted}`}>
                    <span>{(attachment.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>Uploaded by {attachment.uploadedBy.name}</span>
                    <span>•</span>
                    <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <Download className={`relative z-10 w-5 h-5 ${colors.textMuted} group-hover/file:${healthColors.iconColor} group-hover/file:translate-x-1 transition-all duration-300 flex-shrink-0`} />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}