// app/components/ProjectManagement/employee/ProjectDetailComponents.tsx
'use client';

import React from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  Package,
  Users,
  Crown,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import EmployeeDeliverableCard from './EmployeeDeliverableCard';

// Overview Tab Component
export function ProjectOverviewTab({
  project,
  pendingDeliverables
}: {
  project: any;
  pendingDeliverables: number;
}) {
  const { colors } = useTheme();

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
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>MY PENDING TASKS</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {project.myPendingDeliverables || 0}
          </div>
        </div>
      </div>

      {project.targetEndDate && (
        <div className={`p-4 rounded-lg ${colors.cardBg} border ${colors.border}`}>
          <div className={`text-xs font-bold ${colors.textMuted} mb-1`}>TARGET END DATE</div>
          <div className={`text-lg font-black ${colors.textPrimary}`}>
            {new Date(project.targetEndDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Deliverables Tab Component
export function ProjectDeliverablesTab({
  project,
  userId,
  userName,
  onUpdate
}: {
  project: any;
  userId: string;
  userName: string;
  onUpdate: () => void;
}) {
  const { colors, cardCharacters } = useTheme();

  // Separate deliverables into assigned and other
  const myDeliverables = project.deliverables?.filter((d: any) => 
    d.assignedTo.some((assignedId: string) => assignedId === project.myUserId)
  ) || [];
  
  const otherDeliverables = project.deliverables?.filter((d: any) => 
    !d.assignedTo.some((assignedId: string) => assignedId === project.myUserId)
  ) || [];

  return (
    <div className="space-y-6">
      {/* My Deliverables Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-black ${colors.textPrimary}`}>
            My Deliverables ({myDeliverables.length})
          </h3>
        </div>

        {myDeliverables.length === 0 ? (
          <div className={`p-8 text-center rounded-lg ${colors.cardBg} border ${colors.border}`}>
            <Package className={`w-10 h-10 mx-auto mb-2 ${colors.textMuted} opacity-40`} />
            <p className={`${colors.textMuted} text-sm`}>No deliverables assigned to you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myDeliverables.map((deliverable: any) => (
              <EmployeeDeliverableCard
                key={deliverable._id}
                deliverable={deliverable}
                projectId={project._id}
                projectNumber={project.projectNumber}
                userId={userId}
                userName={userName}
                isLead={project.isLead}
                myUserId={project.myUserId}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Other Team Deliverables Section */}
      {otherDeliverables.length > 0 && (
        <div>
          <h3 className={`text-lg font-black ${colors.textPrimary} mb-4`}>
            Team Deliverables ({otherDeliverables.length})
          </h3>
          <div className="space-y-3">
            {otherDeliverables.map((deliverable: any) => (
              <EmployeeDeliverableCard
                key={deliverable._id}
                deliverable={deliverable}
                projectId={project._id}
                projectNumber={project.projectNumber}
                userId={userId}
                userName={userName}
                isLead={project.isLead}
                myUserId={project.myUserId}
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
export function ProjectMembersTab({
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
export function ProjectAttachmentsTab({
  projectAttachments,
  getAttachmentUrl,
  healthColors
}: {
  projectAttachments: any[];
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
          {projectAttachments.map((attachment: any, index: number) => {
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