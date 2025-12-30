// ============================================
// app/components/depthead-project/DeptHeadDetailModal.tsx
// ============================================

import { X, Edit, Calendar, Users, AlertCircle, Paperclip, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { Sprint, Project, Task, Assignee } from './types';
import { renderDescriptionWithMentions } from './utils';

interface DeptHeadDetailModalProps {
  show: boolean;
  onClose: () => void;
  item: Sprint | Project | Task | null;
  theme: string;
  onEdit: (item: Sprint | Project | Task) => void;
  onReview?: undefined;
}

export default function DeptHeadDetailModal({
  show,
  onClose,
  item,
  onEdit
}: DeptHeadDetailModalProps) {
  const { colors, cardCharacters } = useTheme();

  if (!show || !item) return null;

  const isTask = 'projectId' in item;
  const isProject = 'taskCounts' in item;
  const title = 'title' in item ? item.title : 'name' in item ? item.name : '';

  const getPriorityCharacter = (priority: string) => {
    switch(priority) {
      case 'low': return cardCharacters.completed;
      case 'medium': return cardCharacters.informative;
      case 'high': return cardCharacters.interactive;
      case 'urgent': return cardCharacters.urgent;
      default: return cardCharacters.neutral;
    }
  };

  const getStatusCharacter = (status: string) => {
    const statusMap: any = {
      pending: cardCharacters.neutral,
      'in-progress': cardCharacters.informative,
      review: cardCharacters.interactive,
      completed: cardCharacters.completed,
      blocked: cardCharacters.urgent,
      planning: cardCharacters.authoritative,
      active: cardCharacters.completed,
      'on-hold': cardCharacters.interactive,
      cancelled: cardCharacters.urgent,
      todo: cardCharacters.neutral
    };
    return statusMap[status] || cardCharacters.neutral;
  };

  const priorityChar = getPriorityCharacter(item.priority);
  const statusChar = getStatusCharacter(item.status);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      {/* Paper Texture Overlay */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
      
      <div className={`relative rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${colors.shadowDropdown} backdrop-blur-md border ${colors.borderStrong}`}>
        {/* Paper texture in modal */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02] rounded-2xl pointer-events-none`}></div>
        
        <div className={`relative bg-gradient-to-br ${colors.cardBg} rounded-2xl p-8 -m-8`}>
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <h2 className={`text-3xl font-bold mb-2 ${colors.textPrimary}`}>
                {title}
              </h2>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border bg-gradient-to-r ${statusChar.bg} ${statusChar.text} ${statusChar.border}`}>
                  {item.status.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-semibold border bg-gradient-to-r ${priorityChar.bg} ${priorityChar.text} ${priorityChar.border}`}>
                  {item.priority.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onEdit(item);
                  onClose();
                }}
                className={`group relative p-2.5 rounded-xl transition-all overflow-hidden border ${colors.buttonGhost} ${colors.buttonGhostText} ${colors.buttonGhostHover} ${colors.borderSubtle}`}
                title="Edit"
              >
                {/* Paper Texture Layer */}
                <div className={`absolute inset-0 opacity-[0.02] ${colors.paperTexture}`}></div>
                
                <Edit className="w-5 h-5 relative z-10 group-hover:rotate-12 group-hover:translate-x-1 transition-all duration-300" />
              </button>
              <button
                onClick={onClose}
                className={`p-2.5 rounded-xl transition-all ${colors.textMuted} hover:${colors.textPrimary} ${colors.buttonGhostHover}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Project Information for Tasks */}
            {isTask && (
              <div className={`group relative p-4 rounded-xl border overflow-hidden bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`}>
                {/* Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                
                <div className="relative flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" />
                  <h3 className={`font-semibold ${colors.textPrimary}`}>
                    Project
                  </h3>
                </div>
                <p className={`relative text-sm font-medium ${cardCharacters.informative.accent}`}>
                  {item.projectId.name}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4" />
                <h3 className={`font-semibold ${colors.textPrimary}`}>
                  Description
                </h3>
              </div>
              <div className={`p-4 rounded-xl border bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
                <div className={`${colors.textPrimary} leading-relaxed`}>
                  {renderDescriptionWithMentions(item.description, colors)}
                </div>
              </div>
            </div>

            {/* Due Date */}
            {('dueDate' in item && item.dueDate) && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" />
                  <h3 className={`font-semibold ${colors.textPrimary}`}>
                    Due Date
                  </h3>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
                  <Clock className="w-4 h-4" />
                  <span className={colors.textPrimary}>
                    {new Date(item.dueDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Assigned Team Members */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                <h3 className={`font-semibold ${colors.textPrimary}`}>
                  Assigned Team Members
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {item.assignees.map((assignee: Assignee, idx: number) => (
                  <div
                    key={idx}
                    className={`group relative p-4 rounded-xl border transition-all overflow-hidden bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} hover:${cardCharacters.informative.hoverBg}`}
                  >
                    {/* Paper Texture */}
                    <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                    
                    {/* Hover Glow */}
                    <div className="card-glow" style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}></div>
                    
                    <div className="relative">
                      <div className={`font-semibold mb-1 ${cardCharacters.informative.accent}`}>
                        {assignee.name}
                      </div>
                      <div className={`text-xs ${colors.textMuted}`}>
                        {assignee.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocker Information */}
            {item.blockerReason && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className={`w-4 h-4 ${cardCharacters.urgent.iconColor}`} />
                  <h3 className={`font-semibold ${colors.textPrimary}`}>
                    Blocker
                  </h3>
                </div>
                <div className={`p-4 rounded-xl border-l-4 border bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
                  <p className={`text-sm ${cardCharacters.urgent.text}`}>
                    {item.blockerReason}
                  </p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Paperclip className="w-4 h-4" />
                  <h3 className={`font-semibold ${colors.textPrimary}`}>
                    Attachments ({item.attachments.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {item.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative block p-4 rounded-xl transition-all overflow-hidden border bg-gradient-to-br ${colors.cardBg} ${colors.border} ${colors.cardBgHover}`}
                    >
                      {/* Paper Texture */}
                      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                      
                      {/* Hover Glow */}
                      <div className="card-glow" style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}></div>
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Paperclip className="w-4 h-4 flex-shrink-0" />
                          <span className={`text-sm truncate ${colors.textAccent}`}>
                            {att.filename}
                          </span>
                        </div>
                        <span className={`text-xs ml-2 px-2 py-1 rounded ${colors.buttonSecondary} ${colors.buttonSecondaryText}`}>
                          {att.type}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback History */}
            {item.feedback && item.feedback.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className={`font-semibold ${colors.textPrimary}`}>
                    Feedback History ({item.feedback.length})
                  </h3>
                </div>
                <div className="space-y-3">
                  {item.feedback.map((fb, idx) => {
                    const getFeedbackChar = (action: string) => {
                      switch(action) {
                        case 'approved': return cardCharacters.completed;
                        case 'rejected': return cardCharacters.urgent;
                        case 'submitted': return cardCharacters.interactive;
                        default: return cardCharacters.informative;
                      }
                    };
                    
                    const fbChar = getFeedbackChar(fb.action);
                    
                    return (
                      <div
                        key={idx}
                        className={`relative p-4 rounded-xl border overflow-hidden bg-gradient-to-br ${colors.cardBg} ${colors.border}`}
                      >
                        {/* Paper Texture */}
                        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                        
                        <div className="relative">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold ${colors.textAccent}`}>
                                {fb.author.name}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-lg font-medium bg-gradient-to-r ${fbChar.bg} ${fbChar.text} border ${fbChar.border}`}>
                                {fb.action}
                              </span>
                            </div>
                            <span className={`text-xs ${colors.textMuted}`}>
                              {new Date(fb.createdAt).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${colors.textPrimary}`}>
                            {fb.content}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task Progress for Projects */}
            {isProject && item.taskCounts && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4" />
                  <h3 className={`font-semibold ${colors.textPrimary}`}>
                    Task Progress
                  </h3>
                </div>
                <div className={`p-4 rounded-xl border bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={colors.textPrimary}>
                      {item.taskCounts.completed} of {item.taskCounts.total} tasks completed
                    </span>
                    <span className={`font-bold ${colors.textAccent}`}>
                      {Math.round((item.taskCounts.completed / item.taskCounts.total) * 100)}%
                    </span>
                  </div>
                  <div className={`w-full h-3 rounded-full overflow-hidden ${colors.scrollbarTrack}`}
                       style={{ background: colors.scrollbarTrack }}>
                    <div 
                      className={`h-full transition-all duration-500`}
                      style={{ 
                        width: `${(item.taskCounts.completed / item.taskCounts.total) * 100}%`,
                        background: colors.scrollbarThumb
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}