// app/components/employee-project/EmployeeItemCard.tsx

import { Calendar, Users, Play, XCircle, FileText, Clock } from 'lucide-react';
import { Sprint, Task } from '../depthead-project/types';
import { getPriorityColor, getStatusColor, renderDescriptionWithMentions } from '../depthead-project/utils';

interface EmployeeItemCardProps {
  item: Sprint | Task;
  type: 'sprint' | 'task';
  theme: string;
  onViewDetails: (item: Sprint | Task) => void;
  onStart: (id: string) => void;
  onSubmit: (item: Sprint | Task) => void;
  onBlock: (item: Sprint | Task) => void;
}

export default function EmployeeItemCard({
  item,
  type,
  theme,
  onViewDetails,
  onStart,
  onSubmit,
  onBlock
}: EmployeeItemCardProps) {
  const isTask = 'projectId' in item;
  const title = 'title' in item ? item.title : '';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onViewDetails(item);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`p-6 rounded-lg border transition-all cursor-pointer ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900/80 to-black/80 border-[#000080]/40 hover:border-[#0000FF]/60'
          : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          {isTask && (
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-[#87CEEB]' : 'text-[#0000FF]'}`}>
              Project: {item.projectId.name}
            </p>
          )}
        </div>
      </div>
      
      <p className={`mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
        {renderDescriptionWithMentions(item.description, theme)}
      </p>

      <div className="flex flex-wrap gap-3 items-center text-sm mb-4">
        <span className={`px-3 py-1 rounded-full border ${getPriorityColor(item.priority, theme)}`}>
          {item.priority.toUpperCase()}
        </span>
        <span className={`px-3 py-1 rounded-full ${getStatusColor(item.status, theme)}`}>
          {item.status}
        </span>
        {('dueDate' in item && item.dueDate) && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Due: {new Date(item.dueDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {item.attachments && item.attachments.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <FileText className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.attachments.length} attachment{item.attachments.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <Users className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`} />
        {item.assignees.slice(0, 3).map((assignee, idx) => (
          <span
            key={idx}
            className={`text-xs px-2 py-1 rounded ${
              theme === 'dark'
                ? 'bg-blue-900/50 text-[#87CEEB] border border-blue-500'
                : 'bg-blue-50 text-[#0000FF] border border-blue-300'
            }`}
          >
            {assignee.name}
          </span>
        ))}
        {item.assignees.length > 3 && (
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
            +{item.assignees.length - 3} more
          </span>
        )}
      </div>

      {item.blockerReason && (
        <div className={`mb-4 p-3 rounded-lg ${
          theme === 'dark' ? 'bg-red-900/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
            <strong>Blocker:</strong> {item.blockerReason}
          </p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(item.status === 'pending' || item.status === 'todo') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart(item._id);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-blue-900/50 text-[#87CEEB] hover:bg-blue-900/70'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <Play className="w-4 h-4" />
            Start
          </button>
        )}
        
        {item.status === 'in-progress' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSubmit(item);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-900/70'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            Submit for Review
          </button>
        )}

        {item.status === 'review' && (
          <div className={`px-4 py-2 rounded-lg ${
            theme === 'dark'
              ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-300'
          }`}>
            <Clock className="w-4 h-4 inline mr-2" />
            Awaiting Review
          </div>
        )}

        {(item.status === 'pending' || item.status === 'todo' || item.status === 'in-progress') && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBlock(item);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-red-900/50 text-red-300 hover:bg-red-900/70'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            Report Blocker
          </button>
        )}
      </div>
    </div>
  );
}