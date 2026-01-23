// app/components/ProjectManagement/depthead/ActionCard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  ChevronRight,
  Users,
  Calendar,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Paperclip,
  UserPlus,
  UserMinus,
  Loader2,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Zap
} from 'lucide-react';

interface ActionCardProps {
  action: any;
  sprintId: string;
  userId: string;
  userName: string;
  department: string;
  onUpdate: () => void;
}

export default function ActionCard({
  action,
  sprintId,
  userId,
  userName,
  department,
  onUpdate
}: ActionCardProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending': return cardCharacters.neutral;
      case 'in-progress': return cardCharacters.interactive;
      case 'in-review': return cardCharacters.informative;
      case 'done': return cardCharacters.completed;
      default: return cardCharacters.neutral;
    }
  };

  const charColors = getStatusColors(action.status);
  const unresolvedBlockers = action.blockers?.filter((b: any) => !b.isResolved) || [];
  const isOverdue = action.dueDate && new Date(action.dueDate) < new Date() && action.status !== 'done';
  const totalComments = action.comments?.length || 0;
  const totalAttachments = action.attachments?.length || 0;
  const assignedCount = action.assignedTo?.length || 0;

  useEffect(() => {
    if (showMemberManager && availableMembers.length === 0) {
      fetchAvailableMembers();
    }
  }, [showMemberManager]);

  const fetchAvailableMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch(`/api/dept-employees?department=${encodeURIComponent(department)}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableMembers(data.employees || []);
      }
    } catch (error) {
      showToast('Failed to fetch employees', 'error');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ProjectManagement/depthead/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId,
          actionId: action._id,
          action: 'change-status',
          newStatus,
          userId,
          userName
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      const statusLabels: Record<string, string> = {
        'in-progress': 'In Progress',
        'in-review': 'In Review',
        'done': 'Done',
        'pending': 'Pending'
      };
      
      showToast(`Action marked as ${statusLabels[newStatus] || newStatus}`, 'success');
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Failed to update status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/ProjectManagement/depthead/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId,
          actionId: action._id,
          action: 'add-comment',
          message: commentText,
          userId,
          userName
        })
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      showToast('Comment added successfully', 'success');
      setCommentText('');
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Failed to add comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveBlocker = async (blockerIndex: number) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ProjectManagement/depthead/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId,
          actionId: action._id,
          action: 'resolve-blocker',
          blockerIndex,
          userId,
          userName
        })
      });

      if (!response.ok) throw new Error('Failed to resolve blocker');
      
      showToast('Blocker resolved successfully', 'success');
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Failed to resolve blocker', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMember = async (memberId: string) => {
    const isAssigned = action.assignedTo?.some((id: string) => id === memberId);
    
    try {
      setLoading(true);
      const response = await fetch('/api/ProjectManagement/depthead/actions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId,
          actionId: action._id,
          action: isAssigned ? 'remove-member' : 'add-member',
          memberId,
          userId,
          userName
        })
      });

      if (!response.ok) throw new Error('Failed to update team');
      
      showToast(isAssigned ? 'Member removed' : 'Member added', 'success');
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Failed to update team', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <ImageIcon className="w-4 h-4" />;
    if (['pdf'].includes(ext || '')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  if (!expanded) {
    // COLLAPSED STATE - Mini Card Style
    return (
      <div
        onClick={() => setExpanded(true)}
        className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} hover:${colors.shadowHover} transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
      >
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        {/* Internal Glow on Hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
        ></div>

        <div className="relative p-6 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div 
              className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-r ${charColors.bg}`}
            >
              <Zap className={`w-7 h-7 transition-transform duration-500 group-hover:rotate-12 ${charColors.iconColor}`} />
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:translate-x-1 bg-gradient-to-r ${charColors.bg}`}>
              <span className={`text-xs font-bold ${charColors.accent}`}>
                View
              </span>
              <ChevronRight 
                className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${charColors.iconColor}`}
              />
            </div>
          </div>

          {/* Content - Title */}
          <div className="space-y-1">
            <h3 className={`text-xl font-black ${charColors.text} line-clamp-1 group-hover:${charColors.accent} transition-colors duration-300`}>
              {action.title}
            </h3>
          </div>
          
          <p className={`text-sm ${colors.textSecondary} line-clamp-2 min-h-[2.5rem] leading-relaxed`}>
            {action.description || 'No description provided'}
          </p>

          {/* Stats Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {assignedCount > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.inputBg} border ${colors.inputBorder}`}>
                <Users className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                <span className={`text-xs font-semibold ${colors.textSecondary}`}>
                  {assignedCount}
                </span>
              </div>
            )}
            
            {totalComments > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.inputBg} border ${colors.inputBorder}`}>
                <MessageSquare className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                <span className={`text-xs font-semibold ${colors.textSecondary}`}>
                  {totalComments}
                </span>
              </div>
            )}

            {totalAttachments > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.inputBg} border ${colors.inputBorder}`}>
                <Paperclip className={`w-3.5 h-3.5 ${colors.textMuted}`} />
                <span className={`text-xs font-semibold ${colors.textSecondary}`}>
                  {totalAttachments}
                </span>
              </div>
            )}

            {unresolvedBlockers.length > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${cardCharacters.urgent.bg}`}>
                <AlertTriangle className={`w-3.5 h-3.5 ${cardCharacters.urgent.iconColor}`} />
                <span className={`text-xs font-bold ${cardCharacters.urgent.text}`}>
                  {unresolvedBlockers.length} blocker{unresolvedBlockers.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`flex items-center justify-between pt-4 border-t ${charColors.border} transition-colors duration-300`}>
            <div className="flex items-center gap-2">
              <div 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 bg-gradient-to-r ${charColors.bg} ${charColors.text}`}
              >
                {action.status.toUpperCase().replace('-', ' ')}
              </div>
            </div>
            
            {action.dueDate && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isOverdue ? `bg-gradient-to-r ${cardCharacters.urgent.bg} border ${cardCharacters.urgent.border}` : `${colors.inputBg} border ${colors.inputBorder}`}`}>
                <Calendar className={`w-3.5 h-3.5 ${isOverdue ? cardCharacters.urgent.iconColor : colors.textMuted}`} />
                <span className={`text-xs font-semibold ${isOverdue ? cardCharacters.urgent.text + ' font-bold' : colors.textSecondary}`}>
                  {new Date(action.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EXPANDED STATE - Full Detail View
  return (
    <div className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} hover:shadow-lg transition-all duration-300`}>
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
      ></div>

      {/* Header - Clickable to collapse */}
      <div 
        className="relative p-4 cursor-pointer"
        onClick={() => setExpanded(false)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
              <Zap className={`w-5 h-5 ${charColors.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-base font-bold ${charColors.text} truncate`}>
                {action.title}
              </h3>
              <p className={`text-sm ${charColors.text} opacity-70 truncate mt-0.5`}>
                Click to collapse
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {unresolvedBlockers.length > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} border`}>
                <AlertTriangle className={`w-4 h-4 ${cardCharacters.urgent.iconColor}`} />
                <span className={`text-sm font-bold ${cardCharacters.urgent.text}`}>{unresolvedBlockers.length}</span>
              </div>
            )}
            {action.comments?.length > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.inputBg} border ${colors.inputBorder}`}>
                <MessageSquare className={`w-4 h-4 ${colors.textMuted}`} />
                <span className={`text-sm ${colors.textSecondary}`}>{action.comments.length}</span>
              </div>
            )}
            {action.dueDate && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.inputBg} border ${colors.inputBorder}`}>
                <Calendar className={`w-4 h-4 ${isOverdue ? cardCharacters.urgent.iconColor : colors.textMuted}`} />
                <span className={`text-sm ${isOverdue ? cardCharacters.urgent.text + ' font-bold' : colors.textSecondary}`}>
                  {new Date(action.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div 
        className={`relative border-t-2 ${charColors.border} p-4 space-y-4`}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h5 className={`text-xs font-bold ${colors.textMuted} mb-2`}>DESCRIPTION</h5>
          <p className={`text-sm ${charColors.text} leading-relaxed`}>{action.description}</p>
        </div>

        {action.submissionNote && (
          <div className={`p-3 rounded-lg bg-gradient-to-r ${cardCharacters.informative.bg} border-2 ${cardCharacters.informative.border}`}>
            <h5 className={`text-xs font-bold ${colors.textMuted} mb-1.5`}>SUBMISSION NOTE</h5>
            <p className={`text-sm ${colors.textPrimary} mb-2`}>{action.submissionNote}</p>
            <p className={`text-xs ${colors.textMuted}`}>
              Submitted by {action.submittedBy || 'Unknown'} • {new Date(action.submittedAt).toLocaleDateString()}
            </p>
          </div>
        )}

        <div>
          <h5 className={`text-xs font-bold ${colors.textMuted} mb-2`}>QUICK ACTIONS</h5>
          <div className="flex flex-wrap gap-2">
            {action.status !== 'in-progress' && (
              <button onClick={() => handleStatusChange('in-progress')} disabled={loading} className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.text} border-2 ${cardCharacters.interactive.border} disabled:opacity-50 transition-all`}>
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}></div>
                {loading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <Clock className="w-4 h-4 relative z-10" />}
                <span className="relative z-10">In Progress</span>
              </button>
            )}
            {action.status !== 'in-review' && (
              <button onClick={() => handleStatusChange('in-review')} disabled={loading} className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.text} border-2 ${cardCharacters.informative.border} disabled:opacity-50 transition-all`}>
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}></div>
                {loading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <MessageSquare className="w-4 h-4 relative z-10" />}
                <span className="relative z-10">In Review</span>
              </button>
            )}
            {action.status !== 'done' && (
              <button onClick={() => handleStatusChange('done')} disabled={loading} className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text} border-2 ${cardCharacters.completed.border} disabled:opacity-50 transition-all`}>
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 14px ${colors.glowSuccess}` }}></div>
                {loading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <CheckCircle className="w-4 h-4 relative z-10" />}
                <span className="relative z-10">Mark Done</span>
              </button>
            )}
            {action.status === 'done' && (
              <button onClick={() => handleStatusChange('in-progress')} disabled={loading} className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.neutral.bg} ${cardCharacters.neutral.text} border-2 ${cardCharacters.neutral.border} disabled:opacity-50 transition-all`}>
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}></div>
                {loading ? <Loader2 className="w-4 h-4 animate-spin relative z-10" /> : <XCircle className="w-4 h-4 relative z-10" />}
                <span className="relative z-10">Reopen</span>
              </button>
            )}
          </div>
        </div>

        {/* Team Management */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className={`text-xs font-bold ${colors.textMuted}`}>ASSIGNED TEAM ({assignedCount})</h5>
            <button
              onClick={() => setShowMemberManager(!showMemberManager)}
              disabled={loading}
              className={`text-xs font-bold ${cardCharacters.interactive.text} hover:underline flex items-center gap-1`}
            >
              <UserPlus className="w-3 h-3" />
              {showMemberManager ? 'Close' : 'Manage Team'}
            </button>
          </div>
          
          {showMemberManager && (
            <div className={`p-3 rounded-lg ${colors.inputBg} border ${colors.inputBorder} space-y-2 mb-3`}>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className={`w-5 h-5 animate-spin ${colors.textMuted}`} />
                </div>
              ) : availableMembers.length === 0 ? (
                <p className={`text-sm ${colors.textMuted} text-center py-2`}>No employees found in {department}</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableMembers.map((member) => {
                    const isAssigned = action.assignedTo?.some((id: string) => id === member._id || id === member.email);
                    
                    return (
                      <div
                        key={member._id}
                        className={`flex items-center justify-between p-2 rounded-lg ${colors.cardBg} border ${colors.borderSubtle}`}
                      >
                        <div>
                          <p className={`text-sm font-bold ${colors.textPrimary}`}>
                            {member['basicDetails.name'] || member.username}
                          </p>
                          <p className={`text-xs ${colors.textMuted}`}>
                            {member.title || member.email}
                          </p>
                        </div>
                        <button
                          onClick={() => handleToggleMember(member._id)}
                          disabled={loading}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all hover:scale-105 ${
                            isAssigned
                              ? `bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text}`
                              : `bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text}`
                          } disabled:opacity-50`}
                        >
                          {isAssigned ? (
                            <>
                              <UserMinus className="w-3 h-3" />
                              Remove
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3 h-3" />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {unresolvedBlockers.length > 0 && (
          <div>
            <h5 className={`text-xs font-bold ${colors.textMuted} mb-2`}>BLOCKERS ({unresolvedBlockers.length})</h5>
            <div className="space-y-2">
              {action.blockers?.map((blocker: any, index: number) => {
                if (blocker.isResolved) return null;
                return (
                  <div key={index} className={`p-3 rounded-lg bg-gradient-to-r ${cardCharacters.urgent.bg} border-2 ${cardCharacters.urgent.border}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className={`text-sm ${colors.textPrimary} flex-1`}>{blocker.description}</p>
                      <button onClick={() => handleResolveBlocker(index)} disabled={loading} className={`group/btn relative px-3 py-1.5 rounded-lg text-sm font-bold overflow-hidden bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text} border-2 ${cardCharacters.completed.border} disabled:opacity-50 whitespace-nowrap`}>
                        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                        <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ boxShadow: `inset 0 0 14px ${colors.glowSuccess}` }}></div>
                        <span className="relative z-10">{loading ? 'Resolving...' : 'Resolve'}</span>
                      </button>
                    </div>
                    <p className={`text-xs ${colors.textMuted} mt-2`}>{blocker.reportedBy} • {new Date(blocker.reportedAt).toLocaleDateString()}</p>
                    {blocker.attachments && blocker.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {blocker.attachments.map((attachment: string, i: number) => (
                          <a
                            key={i}
                            href={`/api/download?path=${encodeURIComponent(attachment)}`}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className={`flex items-center gap-2 px-2 py-1 rounded-lg ${colors.inputBg} border ${colors.inputBorder} hover:${colors.cardBgHover} transition-all`}
                          >
                            <Paperclip className={`w-3 h-3 ${colors.textMuted}`} />
                            <span className={`text-xs ${colors.textSecondary}`}>
                              {attachment.split('/').pop()?.split('_').slice(1).join('_') || 'Download'}
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {action.attachments && action.attachments.length > 0 && (
          <div>
            <h5 className={`text-xs font-bold ${colors.textMuted} mb-2 flex items-center gap-1.5`}>
              <Paperclip className="w-4 h-4" /> ATTACHMENTS ({action.attachments.length})
            </h5>
            <div className="grid grid-cols-2 gap-2">
              {action.attachments.map((attachment: string, index: number) => {
                const fileName = attachment.split('/').pop()?.split('_').slice(1).join('_') || 'File';
                
                return (
                  <a 
                    key={index} 
                    href={`/api/download?path=${encodeURIComponent(attachment)}`} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={(e) => e.stopPropagation()} 
                    className={`flex items-center gap-2 p-2.5 rounded-lg border-2 ${charColors.border} ${colors.cardBg} hover:${colors.cardBgHover} transition-all group/file`}
                  >
                    <div className={`p-1.5 rounded bg-gradient-to-r ${charColors.bg} ${charColors.iconColor}`}>{getFileIcon(fileName)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${colors.textPrimary} truncate`}>{fileName}</p>
                    </div>
                    <Download className={`w-4 h-4 ${colors.textMuted} group-hover/file:${charColors.iconColor}`} />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h5 className={`text-xs font-bold ${colors.textMuted} mb-2 flex items-center gap-1.5`}>
            <MessageSquare className="w-4 h-4" /> COMMENTS ({action.comments?.length || 0})
          </h5>
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {action.comments?.slice(-3).map((comment: any, index: number) => (
              <div key={index} className={`p-2.5 rounded-lg ${colors.inputBg} border ${colors.inputBorder}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm font-bold ${colors.textPrimary}`}>{comment.userName}</span>
                  <span className={`text-xs ${colors.textMuted}`}>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <p className={`text-sm ${colors.textSecondary}`}>{comment.message}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} onClick={(e) => e.stopPropagation()} placeholder="Add comment..." disabled={loading} className={`flex-1 px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} disabled:opacity-50`} />
            <button type="submit" disabled={!commentText.trim() || loading} className={`px-3 py-2 rounded-lg ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50 hover:scale-105 transition-transform`}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}