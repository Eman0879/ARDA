// app/components/ProjectManagement/employee/SprintDetailComponents.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  Zap,
  Users,
  Crown,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import EmployeeActionCard from './EmployeeActionCard';

// Overview Tab Component
export function SprintOverviewTab({
  sprint,
  pendingActions
}: {
  sprint: any;
  pendingActions: number;
}) {
  const { colors } = useTheme();

  // Calculate days remaining
  const now = new Date();
  const endDate = new Date(sprint.endDate);
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

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
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>MY PENDING ACTIONS</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {sprint.myPendingActions || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>START DATE</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {new Date(sprint.startDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>END DATE</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {new Date(sprint.endDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {sprint.status === 'active' && (
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>DAYS REMAINING</div>
          <div className={`text-lg font-black ${daysRemaining >= 0 ? colors.textPrimary : 'text-red-500'}`}>
            {daysRemaining >= 0 ? `${daysRemaining} days` : `${Math.abs(daysRemaining)} days overdue`}
          </div>
        </div>
      )}
    </div>
  );
}

// Actions Tab Component
export function SprintActionsTab({
  sprint,
  userId,
  userName,
  onUpdate
}: {
  sprint: any;
  userId: string;
  userName: string;
  onUpdate: () => void;
}) {
  const { colors, cardCharacters } = useTheme();

  // Separate actions into assigned and other
  const myActions = sprint.actions?.filter((a: any) => 
    a.assignedTo.some((assignedId: string) => assignedId === sprint.myUserId)
  ) || [];
  
  const otherActions = sprint.actions?.filter((a: any) => 
    !a.assignedTo.some((assignedId: string) => assignedId === sprint.myUserId)
  ) || [];

  return (
    <div className="space-y-6">
      {/* My Actions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-black ${colors.textPrimary}`}>
            My Actions ({myActions.length})
          </h3>
        </div>

        {myActions.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
            <Zap className={`w-10 h-10 mx-auto mb-2 ${colors.textMuted} opacity-40`} />
            <p className={`${colors.textMuted} text-sm`}>No actions assigned to you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myActions.map((action: any) => (
              <EmployeeActionCard
                key={action._id}
                action={action}
                sprintId={sprint._id}
                sprintNumber={sprint.sprintNumber}
                userId={userId}
                userName={userName}
                isLead={sprint.isLead}
                myUserId={sprint.myUserId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other Team Actions Section */}
      {otherActions.length > 0 && (
        <div>
          <h3 className={`text-lg font-black ${colors.textPrimary} mb-4`}>
            Team Actions ({otherActions.length})
          </h3>
          <div className="space-y-3">
            {otherActions.map((action: any) => (
              <EmployeeActionCard
                key={action._id}
                action={action}
                sprintId={sprint._id}
                sprintNumber={sprint.sprintNumber}
                userId={userId}
                userName={userName}
                isLead={sprint.isLead}
                myUserId={sprint.myUserId}
                onUpdate={onUpdate}
                viewOnly={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Members Tab Component
export function SprintMembersTab({
  activeMembers,
  healthColors
}: {
  activeMembers: any[];
  healthColors: any;
}) {
  const { colors, cardCharacters } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-black ${colors.textPrimary}`}>
        Team Members ({activeMembers.length})
      </h3>

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
                {member.department && (
                  <span className={`text-xs px-2 py-0.5 rounded ${colors.badge} ${colors.badgeText}`}>
                    {member.department}
                  </span>
                )}
              </div>
              <p className={`text-sm ${colors.textMuted}`}>
                {member.role === 'lead' ? 'Group Lead' : member.role === 'dept-head' ? 'Department Head' : 'Member'}
              </p>
            </div>
            <span className={`text-xs ${colors.textMuted}`}>
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Attachments Tab Component
export function SprintAttachmentsTab({
  sprintAttachments,
  getAttachmentUrl,
  healthColors
}: {
  sprintAttachments: any[];
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
          {sprintAttachments.map((attachment: any, index: number) => {
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