// ===== app/components/EmployeeAnnouncements/AnnouncementsBoard.tsx =====
'use client';

import React from 'react';
import { Pin } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import AnnouncementCard from './AnnouncementCard';

interface Attachment {
  name: string;
  url: string;
  type: 'image' | 'document';
  size: number;
  uploadedAt: string;
}

interface Comment {
  _id?: string;
  author: string;
  text: string;
  createdAt: string;
  pinned?: boolean;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  comments?: Comment[];
  attachments?: Attachment[];
  pinned?: boolean;
  urgent?: boolean;
  edited?: boolean;
}

interface AnnouncementsBoardProps {
  announcements: Announcement[];
  expandedAnnouncement: string | null;
  newComment: { [key: string]: string };
  onToggleExpand: (id: string) => void;
  onCommentChange: (announcementId: string, comment: string) => void;
  onAddComment: (announcementId: string) => void;
}

export default function AnnouncementsBoard({
  announcements,
  expandedAnnouncement,
  newComment,
  onToggleExpand,
  onCommentChange,
  onAddComment
}: AnnouncementsBoardProps) {
  const { colors } = useTheme();
  
  const displayedAnnouncements = expandedAnnouncement
    ? announcements.filter(a => a._id === expandedAnnouncement)
    : announcements;

  return (
    <div className={`bg-gradient-to-br ${colors.cardBg} backdrop-blur-xl rounded-xl p-5 border-2 ${colors.borderStrong}`}>
      <div className="flex items-center gap-2 mb-4">
        <Pin className="h-6 w-6 text-[#FFD700]" />
        <h3 className={`text-xl font-black ${colors.textPrimary}`}>Department Announcements</h3>
      </div>

      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <Pin className={`h-12 w-12 ${colors.textMuted} mx-auto mb-3`} />
          <p className={`${colors.textAccent} text-base font-semibold`}>No announcements yet</p>
          <p className={`${colors.textMuted} text-sm mt-1.5`}>Check back later for updates from your department head</p>
        </div>
      ) : (
        <div className={`${expandedAnnouncement ? '' : 'flex gap-3 overflow-x-auto pb-3'} custom-scrollbar`}>
          {displayedAnnouncements
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((announcement) => {
              const isExpanded = expandedAnnouncement === announcement._id;
              
              return (
                <div
                  key={announcement._id}
                  className={`${isExpanded ? 'w-full' : 'w-[280px] flex-shrink-0'}`}
                >
                  <AnnouncementCard
                    announcement={announcement}
                    isExpanded={isExpanded}
                    newComment={newComment[announcement._id] || ''}
                    onToggleExpand={() => onToggleExpand(announcement._id)}
                    onCommentChange={(comment) => onCommentChange(announcement._id, comment)}
                    onAddComment={() => onAddComment(announcement._id)}
                  />
                </div>
              );
            })}
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 128, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #FFD700, #FFA500);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #FFA500, #FFD700);
        }
      `}</style>
    </div>
  );
}