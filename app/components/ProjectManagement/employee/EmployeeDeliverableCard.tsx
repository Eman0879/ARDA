// app/components/ProjectManagement/employee/EmployeeDeliverableCard.tsx
'use client';

import React, { useState } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import {
  Package,
  ChevronRight,
  Calendar,
  MessageSquare,
  AlertTriangle,
  Play,
  Send as SendIcon,
  Loader2,
  Paperclip,
  X,
  Download,
  FileText,
  Image as ImageIcon,
  File,
  Flag,
  Clock
} from 'lucide-react';

interface EmployeeDeliverableCardProps {
  deliverable: any;
  projectId: string;
  projectNumber: string;
  userId: string;
  userName: string;
  isLead: boolean;
  myUserId: string;
  onUpdate: () => void;
  viewOnly?: boolean;
}

export default function EmployeeDeliverableCard({
  deliverable,
  projectId,
  projectNumber,
  userId,
  userName,
  isLead,
  myUserId,
  onUpdate,
  viewOnly = false
}: EmployeeDeliverableCardProps) {
  const { colors, cardCharacters, showToast } = useTheme();
  
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [blockerDescription, setBlockerDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'pending': return cardCharacters.neutral;
      case 'in-progress': return cardCharacters.interactive;
      case 'in-review': return cardCharacters.informative;
      case 'done': return cardCharacters.completed;
      default: return cardCharacters.neutral;
    }
  };

  const charColors = getStatusColors(deliverable.status);
  const unresolvedBlockers = deliverable.blockers?.filter((b: any) => !b.isResolved) || [];
  const isOverdue = deliverable.dueDate && new Date(deliverable.dueDate) < new Date() && deliverable.status !== 'done';
  const totalComments = deliverable.comments?.length || 0;
  const totalAttachments = deliverable.attachments?.length || 0;
  const isAssignedToMe = deliverable.assignedTo.some((assignedId: string) => assignedId === myUserId);

  const handleAction = async (action: string, additionalData?: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/ProjectManagement/employee/deliverables', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          deliverableId: deliverable._id,
          action,
          userId,
          userName,
          ...additionalData
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update deliverable');
      }
      
      const actionLabels: Record<string, string> = {
        'start-work': 'Started working on deliverable',
        'submit-for-review': 'Submitted deliverable for review',
        'add-comment': 'Comment added',
        'report-blocker': 'Blocker reported'
      };
      
      showToast(actionLabels[action] || 'Action completed', 'success');
      onUpdate();
    } catch (error: any) {
      showToast(error.message || 'Failed to perform action', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      file
    }));

    setAttachments((prev) => [...prev, ...newFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitForReview = async () => {
    if (!submissionNote.trim()) {
      showToast('Please provide a submission note', 'warning');
      return;
    }

    const filesData = await Promise.all(
      attachments.map(async (att) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(att.file);
        });

        return {
          name: att.name,
          data: base64.split(',')[1],
          type: att.type,
          size: att.size
        };
      })
    );

    await handleAction('submit-for-review', {
      submissionNote,
      files: filesData
    });

    setShowSubmitModal(false);
    setSubmissionNote('');
    setAttachments([]);
  };

  const handleReportBlocker = async () => {
    if (!blockerDescription.trim()) {
      showToast('Please describe the blocker', 'warning');
      return;
    }

    const filesData = await Promise.all(
      attachments.map(async (att) => {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(att.file);
        });

        return {
          name: att.name,
          data: base64.split(',')[1],
          type: att.type,
          size: att.size
        };
      })
    );

    await handleAction('report-blocker', {
      description: blockerDescription,
      files: filesData
    });

    setShowBlockerModal(false);
    setBlockerDescription('');
    setAttachments([]);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    await handleAction('add-comment', { message: commentText });
    setCommentText('');
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')) return <ImageIcon className="w-4 h-4" />;
    if (['pdf'].includes(ext || '')) return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getAttachmentUrl = (attachmentPath: string): string => {
    if (attachmentPath.includes('\\') || attachmentPath.startsWith('D:') || attachmentPath.startsWith('C:')) {
      const uploadsIndex = attachmentPath.indexOf('uploads');
      if (uploadsIndex !== -1) {
        const relativePath = attachmentPath.substring(uploadsIndex).replace(/\\/g, '/');
        return `/api/attachments/${relativePath.replace('uploads/projects/', '')}`;
      }
    }
    return `/api/attachments/${attachmentPath.replace('uploads/projects/', '')}`;
  };

  if (!expanded) {
    // COLLAPSED STATE
    return (
      <div
        onClick={() => setExpanded(true)}
        className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} hover:${colors.shadowHover} transition-all duration-300 hover:scale-[1.02] cursor-pointer ${viewOnly ? 'opacity-70' : ''}`}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
        ></div>

        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div 
              className={`p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-gradient-to-r ${charColors.bg}`}
            >
              <Package className={`w-7 h-7 transition-transform duration-500 group-hover:rotate-12 ${charColors.iconColor}`} />
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 group-hover:translate-x-1 bg-gradient-to-r ${charColors.bg}`}>
              <span className={`text-xs font-bold ${charColors.accent}`}>
                {viewOnly ? 'View' : 'Manage'}
              </span>
              <ChevronRight 
                className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${charColors.iconColor}`}
              />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className={`text-xl font-black ${charColors.text} line-clamp-1 group-hover:${charColors.accent} transition-colors duration-300`}>
              {deliverable.title}
            </h3>
          </div>
          
          <p className={`text-sm ${colors.textSecondary} line-clamp-2 min-h-[2.5rem] leading-relaxed`}>
            {deliverable.description || 'No description provided'}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            {!viewOnly && !isAssignedToMe && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${colors.badge} ${colors.badgeText}`}>
                <span className={`text-xs font-semibold`}>
                  Not Assigned
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

          <div className={`flex items-center justify-between pt-4 border-t ${charColors.border} transition-colors duration-300`}>
            <div className="flex items-center gap-2">
              <div 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300 bg-gradient-to-r ${charColors.bg} ${charColors.text}`}
              >
                {deliverable.status.toUpperCase().replace('-', ' ')}
              </div>
            </div>
            
            {deliverable.dueDate && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isOverdue ? `bg-gradient-to-r ${cardCharacters.urgent.bg} border ${cardCharacters.urgent.border}` : `${colors.inputBg} border ${colors.inputBorder}`}`}>
                <Calendar className={`w-3.5 h-3.5 ${isOverdue ? cardCharacters.urgent.iconColor : colors.textMuted}`} />
                <span className={`text-xs font-semibold ${isOverdue ? cardCharacters.urgent.text + ' font-bold' : colors.textSecondary}`}>
                  {new Date(deliverable.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // EXPANDED STATE
  return (
    <>
      <div 
        className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} hover:shadow-lg transition-all duration-300 ${viewOnly ? 'opacity-70' : ''}`}
      >
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03] pointer-events-none`}></div>
        <div 
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
        ></div>

        {/* Header */}
        <div 
          className="relative p-4 cursor-pointer"
          onClick={() => setExpanded(false)}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <Package className={`w-5 h-5 ${charColors.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold ${charColors.text} truncate`}>
                  {deliverable.title}
                </h3>
                <p className={`text-sm ${charColors.text} opacity-70 truncate mt-0.5`}>
                  Click to collapse
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {!isAssignedToMe && (
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold ${colors.badge} ${colors.badgeText}`}>
                  View Only
                </div>
              )}
              {unresolvedBlockers.length > 0 && (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} border`}>
                  <AlertTriangle className={`w-4 h-4 ${cardCharacters.urgent.iconColor}`} />
                  <span className={`text-sm font-bold ${cardCharacters.urgent.text}`}>{unresolvedBlockers.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div 
          className={`relative border-t-2 ${charColors.border} p-4 space-y-4`}
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <h5 className={`text-xs font-bold ${colors.textMuted} mb-2`}>DESCRIPTION</h5>
            <p className={`text-sm ${charColors.text} leading-relaxed`}>{deliverable.description}</p>
          </div>

          {deliverable.submissionNote && (
            <div className={`p-3 rounded-lg bg-gradient-to-r ${cardCharacters.informative.bg} border-2 ${cardCharacters.informative.border}`}>
              <h5 className={`text-xs font-bold ${colors.textMuted} mb-1.5`}>SUBMISSION NOTE</h5>
              <p className={`text-sm ${colors.textPrimary} mb-2`}>{deliverable.submissionNote}</p>
              <p className={`text-xs ${colors.textMuted}`}>Submitted {new Date(deliverable.submittedAt).toLocaleDateString()}</p>
            </div>
          )}

          {!viewOnly && isAssignedToMe && (
            <div>
              <h5 className={`text-xs font-bold ${colors.textMuted} mb-2`}>QUICK ACTIONS</h5>
              <div className="flex flex-wrap gap-2">
                {deliverable.status === 'pending' && (
                  <button 
                    onClick={() => handleAction('start-work')} 
                    disabled={loading}
                    className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.text} border-2 ${cardCharacters.interactive.border} disabled:opacity-50 transition-all`}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>Start Work</span>
                  </button>
                )}
                
                {deliverable.status === 'in-progress' && (
                  <button 
                    onClick={() => setShowSubmitModal(true)} 
                    disabled={loading}
                    className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text} border-2 ${cardCharacters.completed.border} disabled:opacity-50 transition-all`}
                  >
                    <SendIcon className="w-4 h-4" />
                    <span>Submit for Review</span>
                  </button>
                )}
                
                {deliverable.status !== 'done' && (
                  <button 
                    onClick={() => setShowBlockerModal(true)} 
                    disabled={loading}
                    className={`group/btn relative px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 overflow-hidden bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text} border-2 ${cardCharacters.urgent.border} disabled:opacity-50 transition-all`}
                  >
                    <Flag className="w-4 h-4" />
                    <span>Report Blocker</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {unresolvedBlockers.length > 0 && (
            <div>
              <h5 className={`text-xs font-bold ${colors.textMuted} mb-2`}>BLOCKERS ({unresolvedBlockers.length})</h5>
              <div className="space-y-2">
                {deliverable.blockers?.map((blocker: any, index: number) => {
                  if (blocker.isResolved) return null;
                  return (
                    <div key={index} className={`p-3 rounded-lg bg-gradient-to-r ${cardCharacters.urgent.bg} border-2 ${cardCharacters.urgent.border}`}>
                      <p className={`text-sm ${colors.textPrimary}`}>{blocker.description}</p>
                      <p className={`text-xs ${colors.textMuted} mt-2`}>{blocker.reportedBy} • {new Date(blocker.reportedAt).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {deliverable.attachments && deliverable.attachments.length > 0 && (
            <div>
              <h5 className={`text-xs font-bold ${colors.textMuted} mb-2 flex items-center gap-1.5`}>
                <Paperclip className="w-4 h-4" /> ATTACHMENTS ({deliverable.attachments.length})
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {deliverable.attachments.map((attachment: any, index: number) => {
                  const fileUrl = typeof attachment === 'string' ? getAttachmentUrl(attachment) : getAttachmentUrl(attachment.path);
                  const fileName = typeof attachment === 'string' ? attachment.split('/').pop()?.split('_').slice(1).join('_') || 'File' : attachment.name;
                  
                  return (
                    <a key={index} href={fileUrl} download target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-2.5 rounded-lg border-2 ${charColors.border} ${colors.cardBg} hover:${colors.cardBgHover} transition-all group/file`}>
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
              <MessageSquare className="w-4 h-4" /> COMMENTS ({deliverable.comments?.length || 0})
            </h5>
            <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
              {deliverable.comments?.slice(-3).map((comment: any, index: number) => (
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
              <input 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)} 
                placeholder="Add comment..." 
                disabled={loading}
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} disabled:opacity-50`} 
              />
              <button 
                type="submit" 
                disabled={!commentText.trim() || loading}
                className={`px-3 py-2 rounded-lg ${colors.buttonPrimary} ${colors.buttonPrimaryText} disabled:opacity-50 hover:scale-105 transition-transform`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSubmitModal(false)}>
          <div className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border} max-w-2xl w-full p-6 space-y-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-black ${colors.textPrimary}`}>Submit for Review</h3>
            <textarea
              value={submissionNote}
              onChange={(e) => setSubmissionNote(e.target.value)}
              placeholder="Describe what you've completed..."
              rows={4}
              className={`w-full px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
            />
            
            <div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className={`px-4 py-2 rounded-lg ${colors.buttonSecondary} ${colors.buttonSecondaryText} flex items-center gap-2`}>
                <Paperclip className="w-4 h-4" />
                Attach Files
              </button>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((att, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded ${colors.inputBg}`}>
                      <span className={`text-sm ${colors.textPrimary}`}>{att.name}</span>
                      <button onClick={() => removeAttachment(i)}><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleSubmitForReview} disabled={loading} className={`flex-1 px-4 py-2 rounded-lg ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit'}
              </button>
              <button onClick={() => setShowSubmitModal(false)} className={`px-4 py-2 rounded-lg ${colors.buttonGhost} ${colors.buttonGhostText}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Blocker Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowBlockerModal(false)}>
          <div className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border} max-w-2xl w-full p-6 space-y-4`} onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-xl font-black ${colors.textPrimary}`}>Report Blocker</h3>
            <textarea
              value={blockerDescription}
              onChange={(e) => setBlockerDescription(e.target.value)}
              placeholder="Describe what's blocking progress..."
              rows={4}
              className={`w-full px-3 py-2 rounded-lg text-sm ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
            />
            
            <div>
              <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className={`px-4 py-2 rounded-lg ${colors.buttonSecondary} ${colors.buttonSecondaryText} flex items-center gap-2`}>
                <Paperclip className="w-4 h-4" />
                Attach Files
              </button>
              {attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachments.map((att, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded ${colors.inputBg}`}>
                      <span className={`text-sm ${colors.textPrimary}`}>{att.name}</span>
                      <button onClick={() => removeAttachment(i)}><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button onClick={handleReportBlocker} disabled={loading} className={`flex-1 px-4 py-2 rounded-lg ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Report'}
              </button>
              <button onClick={() => setShowBlockerModal(false)} className={`px-4 py-2 rounded-lg ${colors.buttonGhost} ${colors.buttonGhostText}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}