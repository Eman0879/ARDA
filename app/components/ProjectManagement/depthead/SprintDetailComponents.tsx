// app/components/ProjectManagement/depthead/SprintDetailComponents.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  Zap,
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
  Plus,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import ActionCard from './ActionCard';

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
export function SprintOverviewTab({
  sprint,
  pendingActions,
  onStatusAction,
  actionLoading
}: {
  sprint: any;
  pendingActions: number;
  onStatusAction: (action: string) => void;
  actionLoading: boolean;
}) {
  const { colors, cardCharacters } = useTheme();

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
        <h3 className={`text-sm font-bold ${colors.textPrimary} mb-2`}>Description</h3>
        <p className={`text-sm ${colors.textSecondary}`}>{sprint.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>STATUS</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {sprint.status.toUpperCase()}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>HEALTH</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {sprint.health.toUpperCase().replace('-', ' ')}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>ACTIONS</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {pendingActions} Pending
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {sprint.status === 'active' && (
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
              Complete Sprint
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusAction('close');
              }}
              disabled={actionLoading}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 border-2 ${cardCharacters.neutral.border} ${cardCharacters.neutral.text} disabled:opacity-50`}
            >
              <Archive className="w-4 h-4" />
              Close Sprint
            </button>
          </>
        )}
        {(sprint.status === 'completed' || sprint.status === 'closed') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusAction('reopen');
            }}
            disabled={actionLoading}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.text} disabled:opacity-50`}
          >
            <RotateCcw className="w-4 h-4" />
            Reopen Sprint
          </button>
        )}
      </div>
    </div>
  );
}

// Actions Tab Component
export function SprintActionsTab({
  sprint,
  userId,
  userName,
  department,
  onUpdate,
  onCreateAction
}: {
  sprint: any;
  userId: string;
  userName: string;
  department: string;
  onUpdate: () => void;
  onCreateAction: () => void;
}) {
  const { colors } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-black ${colors.textPrimary}`}>
          Actions ({sprint.actions?.length || 0})
        </h3>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCreateAction();
          }}
          style={{ pointerEvents: 'auto', cursor: 'pointer' }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors duration-300 flex items-center gap-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} hover:scale-105`}
        >
          <Plus className="w-4 h-4" />
          Add Action
        </button>
      </div>

      {sprint.actions?.length === 0 ? (
        <div className={`p-12 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <Zap className={`w-12 h-12 mx-auto mb-3 ${colors.textMuted} opacity-40`} />
          <p className={`${colors.textPrimary} font-bold mb-2`}>No actions yet</p>
          <p className={`${colors.textSecondary} text-sm`}>
            Create your first action to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sprint.actions.map((action: any) => (
            <ActionCard
              key={action._id}
              action={action}
              sprintId={sprint._id}
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
export function SprintMembersTab({
  sprint,
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
  sprint: any;
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
export function SprintChatTab({
  sprint,
  chatMessage,
  setChatMessage,
  onSendMessage,
  actionLoading
}: {
  sprint: any;
  chatMessage: string;
  setChatMessage: (msg: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
  actionLoading: boolean;
}) {
  const { colors } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-black ${colors.textPrimary}`}>
        Sprint Chat
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sprint.chat?.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
            <MessageSquare className={`w-10 h-10 mx-auto mb-2 ${colors.textMuted} opacity-40`} />
            <p className={`${colors.textMuted} text-sm`}>No messages yet</p>
          </div>
        ) : (
          sprint.chat?.map((msg: any, index: number) => (
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
export function SprintAttachmentsTab({
  sprintAttachments,
  getAttachmentUrl,
  healthColors
}: {
  sprintAttachments: Attachment[];
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
        Sprint Attachments ({sprintAttachments.length})
      </h3>

      {sprintAttachments.length === 0 ? (
        <div className={`p-12 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <Paperclip className={`w-12 h-12 mx-auto mb-3 ${colors.textMuted} opacity-40`} />
          <p className={`${colors.textPrimary} font-bold mb-2`}>No attachments</p>
          <p className={`${colors.textSecondary} text-sm`}>
            Attachments uploaded with this sprint will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sprintAttachments.map((attachment: Attachment, index: number) => {
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