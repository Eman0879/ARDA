// app/components/DeptHeadAnnouncements/AnnouncementsBoardCompact.tsx
'use client';

import React from 'react';
import { Pin, Plus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import { Announcement, Attachment } from './types';
import NewAnnouncementForm from './NewAnnouncementForm';
import AnnouncementCard from './AnnouncementCard';

interface AnnouncementsBoardCompactProps {
  announcements: Announcement[];
  showNewAnnouncement: boolean;
  newTitle: string;
  newContent: string;
  selectedColor: string;
  expirationDate: string;
  newAttachments: Attachment[];
  expandedAnnouncement: string | null;
  newComment: { [key: string]: string };
  editingAnnouncement: string | null;
  editTitle: string;
  editContent: string;
  editAttachments: Attachment[];
  onToggleNewAnnouncement: () => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onColorChange: (color: string) => void;
  onExpirationDateChange: (date: string) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onCancelNew: () => void;
  onPostNew: () => void;
  onToggleExpand: (id: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onToggleUrgent: (id: string, currentUrgent: boolean) => void;
  onDelete: (id: string) => void;
  onStartEdit: (announcement: Announcement) => void;
  onCancelEdit: () => void;
  onSaveEdit: (id: string) => void;
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onEditAttachmentsChange: (attachments: Attachment[]) => void;
  onCommentChange: (announcementId: string, comment: string) => void;
  onAddComment: (announcementId: string) => void;
  onToggleCommentPin: (announcementId: string, commentId: string, currentPinned: boolean) => void;
}

export default function AnnouncementsBoardCompact(props: AnnouncementsBoardCompactProps) {
  const { theme, colors } = useTheme();
  const router = useRouter();
  const {
    announcements,
    expandedAnnouncement,
    showNewAnnouncement,
    newTitle,
    newContent,
    selectedColor,
    expirationDate,
    newAttachments,
    newComment,
    editingAnnouncement,
    editTitle,
    editContent,
    editAttachments,
    onToggleNewAnnouncement,
    onTitleChange,
    onContentChange,
    onColorChange,
    onExpirationDateChange,
    onAttachmentsChange,
    onCancelNew,
    onPostNew,
    onToggleExpand,
    onTogglePin,
    onToggleUrgent,
    onDelete,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onEditTitleChange,
    onEditContentChange,
    onEditAttachmentsChange,
    onCommentChange,
    onAddComment,
    onToggleCommentPin
  } = props;

  // Show only 3 latest announcements on home page
  const latestAnnouncements = expandedAnnouncement
    ? announcements.filter(a => a._id === expandedAnnouncement)
    : announcements
        .sort((a, b) => {
          // Sort: urgent first, then pinned, then by date
          if (a.urgent && !b.urgent) return -1;
          if (!a.urgent && b.urgent) return 1;
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, 3);

  return (
    <div className="relative">
      {/* Floating Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pin className="h-6 w-6 text-[#FFD700]" />
          <h3 className={`text-xl font-black ${colors.textPrimary}`}>
            Latest Announcements
          </h3>
          {announcements.length > 3 && !expandedAnnouncement && (
            <span className={`text-sm ${colors.textMuted} font-semibold`}>
              ({announcements.length} total)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleNewAnnouncement}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-bold">New</span>
          </button>
          {announcements.length > 0 && (
            <button
              onClick={() => router.push('/dept-head/announcements')}
              className={`flex items-center gap-1.5 px-4 py-2 ${colors.cardBg} backdrop-blur-sm border-2 ${colors.border} hover:${colors.borderStrong} rounded-lg transition-all duration-300 hover:shadow-lg transform hover:scale-105`}
            >
              <span className={`${colors.textPrimary} text-sm font-bold`}>View All</span>
              <ArrowRight className={`h-4 w-4 ${colors.textAccent}`} />
            </button>
          )}
        </div>
      </div>

      {/* New Announcement Form */}
      {showNewAnnouncement && (
        <div className={`mb-4 backdrop-blur-xl bg-gradient-to-br ${colors.cardBg} rounded-xl border-2 ${colors.borderStrong}`}>
          <NewAnnouncementForm
            newTitle={newTitle}
            setNewTitle={onTitleChange}
            newContent={newContent}
            setNewContent={onContentChange}
            selectedColor={selectedColor}
            setSelectedColor={onColorChange}
            expirationDate={expirationDate}
            setExpirationDate={onExpirationDateChange}
            attachments={newAttachments}
            setAttachments={onAttachmentsChange}
            onCancel={onCancelNew}
            onPost={onPostNew}
          />
        </div>
      )}

      {/* Announcements Display */}
      {announcements.length === 0 ? (
        <div className={`text-center py-12 backdrop-blur-xl bg-gradient-to-br ${colors.cardBg} rounded-xl border-2 ${colors.border}`}>
          <Pin className={`h-12 w-12 ${colors.textMuted} mx-auto mb-3`} />
          <p className={`${colors.textAccent} text-base font-semibold`}>No announcements yet</p>
          <p className={`${colors.textMuted} text-sm mt-1.5`}>Create your first announcement to share with your team</p>
        </div>
      ) : (
        <div className={`${expandedAnnouncement ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
          {latestAnnouncements.map((announcement) => {
            const isExpanded = expandedAnnouncement === announcement._id;
            const isEditing = editingAnnouncement === announcement._id;
            
            return (
              <div
                key={announcement._id}
                className={`${isExpanded ? 'col-span-full' : ''} transition-all duration-300`}
              >
                <AnnouncementCard
                  announcement={announcement}
                  isExpanded={isExpanded}
                  isEditing={isEditing}
                  editTitle={editTitle}
                  editContent={editContent}
                  editAttachments={editAttachments}
                  newComment={newComment[announcement._id] || ''}
                  onToggleExpand={() => onToggleExpand(announcement._id)}
                  onTogglePin={() => onTogglePin(announcement._id, announcement.pinned || false)}
                  onToggleUrgent={() => onToggleUrgent(announcement._id, announcement.urgent || false)}
                  onDelete={() => onDelete(announcement._id)}
                  onStartEdit={() => onStartEdit(announcement)}
                  onCancelEdit={onCancelEdit}
                  onSaveEdit={() => onSaveEdit(announcement._id)}
                  onEditTitleChange={onEditTitleChange}
                  onEditContentChange={onEditContentChange}
                  onEditAttachmentsChange={onEditAttachmentsChange}
                  onCommentChange={(comment) => onCommentChange(announcement._id, comment)}
                  onAddComment={() => onAddComment(announcement._id)}
                  onToggleCommentPin={(commentId, currentPinned) => 
                    onToggleCommentPin(announcement._id, commentId, currentPinned)
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}