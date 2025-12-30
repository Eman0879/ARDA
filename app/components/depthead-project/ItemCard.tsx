// app/components/depthead-project/ItemCard.tsx

import { Trash2, Edit, Calendar, Users, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { Sprint, Project, Task, ActiveTab } from './types';
import { renderDescriptionWithMentions } from './utils';

interface ItemCardProps {
  item: Sprint | Project | Task;
  type: ActiveTab;
  onDelete: () => void;
  onEdit: (item: Sprint | Project | Task) => void;
  onApprove?: (item: Sprint | Task) => void;
  onReject?: (item: Sprint | Task) => void;
  onViewDetails?: (item: Sprint | Project | Task) => void;
}

export default function ItemCard({
  item,
  type,
  onDelete,
  onEdit,
  onApprove,
  onReject,
  onViewDetails
}: ItemCardProps) {
  const { colors, cardCharacters } = useTheme();
  
  const isTask = 'projectId' in item;
  const isProject = 'taskCounts' in item;
  const title = 'title' in item ? item.title : 'name' in item ? item.name : '';
  const showReviewButtons = item.status === 'review' && onApprove && onReject;

  // Get character based on priority
  const getPriorityChar = () => {
    switch(item.priority) {
      case 'low': return cardCharacters.completed;
      case 'medium': return cardCharacters.informative;
      case 'high': return cardCharacters.interactive;
      case 'urgent': return cardCharacters.urgent;
      default: return cardCharacters.neutral;
    }
  };

  // Get character based on status
  const getStatusChar = () => {
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
    return statusMap[item.status] || cardCharacters.neutral;
  };

  const priorityChar = getPriorityChar();
  const statusChar = getStatusChar();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (onViewDetails) {
      onViewDetails(item);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative p-6 rounded-xl border transition-all cursor-pointer overflow-hidden bg-gradient-to-br ${colors.cardBg} ${colors.border} hover:${colors.cardBgHover} ${colors.shadowCard} hover:${colors.shadowHover}`}
    >
      {/* Paper Texture */}
      <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
      
      {/* Hover Glow */}
      <div className="card-glow" style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}></div>
      
      <div className="relative">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className={`text-xl font-bold ${colors.textPrimary}`}>
              {title}
            </h3>
            {isTask && (
              <p className={`text-sm mt-1 ${colors.textAccent}`}>
                Project: {item.projectId.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(item);
              }}
              className={`group/btn relative p-2 rounded-lg transition-all overflow-hidden border ${colors.buttonGhost} ${colors.buttonGhostText} ${colors.buttonGhostHover} ${colors.borderSubtle}`}
              title="Edit"
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <Edit className="w-5 h-5 relative z-10 group-hover/btn:rotate-12 group-hover/btn:translate-x-1 transition-all duration-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className={`group/btn relative p-2 rounded-lg transition-all overflow-hidden border bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text} hover:${cardCharacters.urgent.hoverBg} ${cardCharacters.urgent.border}`}
              title="Delete"
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <Trash2 className="w-5 h-5 relative z-10 group-hover/btn:rotate-12 group-hover/btn:translate-x-1 transition-all duration-300" />
            </button>
          </div>
        </div>
        
        <p className={`mb-4 ${colors.textSecondary}`}>
          {renderDescriptionWithMentions(item.description, colors)}
        </p>

        <div className="flex flex-wrap gap-3 items-center text-sm mb-4">
          <span className={`px-3 py-1 rounded-lg border bg-gradient-to-r ${priorityChar.bg} ${priorityChar.text} ${priorityChar.border}`}>
            {item.priority.toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-lg border bg-gradient-to-r ${statusChar.bg} ${statusChar.text} ${statusChar.border}`}>
            {item.status.replace('-', ' ').toUpperCase()}
          </span>
          {('dueDate' in item && item.dueDate) && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className={colors.textSecondary}>
                Due: {new Date(item.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {isProject && item.taskCounts && (
          <div className={`text-sm mb-4 ${colors.textSecondary}`}>
            Tasks: {item.taskCounts.total} total, {item.taskCounts.completed} completed
          </div>
        )}

        {item.attachments && item.attachments.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <FileText className={`w-4 h-4 ${colors.textMuted}`} />
            <span className={`text-sm ${colors.textSecondary}`}>
              {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {item.feedback && item.feedback.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Eye className={`w-4 h-4 ${colors.textMuted}`} />
            <span className={`text-sm ${colors.textSecondary}`}>
              {item.feedback.length} feedback message{item.feedback.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Users className={`w-4 h-4 ${colors.textMuted}`} />
          {item.assignees.slice(0, 3).map((assignee, idx) => (
            <span
              key={idx}
              className={`text-xs px-2 py-1 rounded-lg border bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.text} ${cardCharacters.informative.border}`}
            >
              {assignee.name}
            </span>
          ))}
          {item.assignees.length > 3 && (
            <span className={`text-xs ${colors.textMuted}`}>
              +{item.assignees.length - 3} more
            </span>
          )}
        </div>

        {item.blockerReason && (
          <div className={`mt-4 p-3 rounded-lg border bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border}`}>
            <p className={`text-sm ${cardCharacters.urgent.text}`}>
              <strong>Blocker:</strong> {item.blockerReason}
            </p>
          </div>
        )}

        {showReviewButtons && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove(item as Sprint | Task);
              }}
              className={`group/btn relative flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all overflow-hidden border bg-gradient-to-r ${cardCharacters.completed.bg} ${cardCharacters.completed.text} hover:${cardCharacters.completed.hoverBg} ${cardCharacters.completed.border}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <CheckCircle className="w-4 h-4 relative z-10 group-hover/btn:rotate-12 transition-all duration-300" />
              <span className="relative z-10">Approve</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReject(item as Sprint | Task);
              }}
              className={`group/btn relative flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-all overflow-hidden border bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text} hover:${cardCharacters.urgent.hoverBg} ${cardCharacters.urgent.border}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <XCircle className="w-4 h-4 relative z-10 group-hover/btn:rotate-12 transition-all duration-300" />
              <span className="relative z-10">Reject</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}