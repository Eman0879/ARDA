// app/components/employee-project/DetailModal.tsx

import { X, MessageSquare } from 'lucide-react';
import MentionTextarea from '../depthead-project/MentionTextarea';
import { Sprint, Task, TeamMember, Assignee } from '../depthead-project/types';
import { renderDescriptionWithMentions } from '../depthead-project/utils';

interface DetailModalProps {
  show: boolean;
  onClose: () => void;
  item: Sprint | Task | null;
  theme: string;
  teamMembers: TeamMember[];
  commentText: string;
  setCommentText: (text: string) => void;
  commentMentions: string[];
  setCommentMentions: (mentions: string[]) => void;
  onAddComment: () => Promise<void>;
}

export default function DetailModal({
  show,
  onClose,
  item,
  theme,
  teamMembers,
  commentText,
  setCommentText,
  commentMentions,
  setCommentMentions,
  onAddComment
}: DetailModalProps) {
  if (!show || !item) return null;

  const isTask = 'projectId' in item;
  const title = 'title' in item ? item.title : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-black border border-[#000080]'
          : 'bg-white border border-gray-300'
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Description
            </h3>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              {renderDescriptionWithMentions(item.description, theme)}
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Assigned Team Members
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.assignees.map((assignee: Assignee, idx: number) => (
                <div
                  key={idx}
                  className={`px-3 py-2 rounded-lg ${
                    theme === 'dark'
                      ? 'bg-blue-900/50 border border-blue-500'
                      : 'bg-blue-50 border border-blue-300'
                  }`}
                >
                  <div className={`font-medium ${theme === 'dark' ? 'text-[#87CEEB]' : 'text-[#0000FF]'}`}>
                    {assignee.name}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {assignee.email}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {item.attachments && item.attachments.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Attachments
              </h3>
              <div className="space-y-2">
                {item.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block p-3 rounded-lg hover:opacity-80 ${
                      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${theme === 'dark' ? 'text-[#87CEEB]' : 'text-[#0000FF]'}`}>
                        {att.filename}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {att.type}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {item.feedback && item.feedback.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Feedback History
              </h3>
              <div className="space-y-3">
                {item.feedback.map((fb, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border border-gray-700'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`font-semibold ${theme === 'dark' ? 'text-[#87CEEB]' : 'text-[#0000FF]'}`}>
                          {fb.author.name}
                        </span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded ${
                          fb.action === 'approved' 
                            ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-700'
                            : fb.action === 'rejected'
                            ? theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-700'
                            : theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {fb.action}
                        </span>
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(fb.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {fb.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isTask && 'comments' in item && item.comments && item.comments.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Comments
              </h3>
              <div className="space-y-3">
                {item.comments.map((comment: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-gray-800/50 border border-gray-700'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-[#87CEEB]' : 'text-[#0000FF]'}`}>
                        {comment.author.name}
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                      {renderDescriptionWithMentions(comment.content, theme)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isTask && (
            <div>
              <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Add Comment
              </h3>
              <MentionTextarea
                value={commentText}
                onChange={(text, mentions) => {
                  setCommentText(text);
                  setCommentMentions(mentions);
                }}
                placeholder="Type your comment... Use @ to mention team members"
                teamMembers={teamMembers}
                rows={3}
              />
              <button
                onClick={onAddComment}
                className={`mt-2 px-4 py-2 rounded-lg transition-all ${
                  theme === 'dark'
                    ? 'bg-[#0000FF] text-white hover:shadow-[0_0_20px_rgba(0,0,255,0.8)] border border-blue-500'
                    : 'bg-[#0000FF] text-white hover:shadow-[0_0_15px_rgba(0,0,255,0.6)] border border-blue-600'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Post Comment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}