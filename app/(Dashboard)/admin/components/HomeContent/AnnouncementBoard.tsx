// app/(Dashboard)/dept-head/components/HomeContent/AnnouncementsBoard.tsx
'use client';

import React from 'react';
import { Pin, Plus } from 'lucide-react';
import { Announcement, Attachment } from './types';
import NewAnnouncementForm from './NewAnnouncementForm';
import AnnouncementCard from './AnnouncementCard';

interface AnnouncementsBoardProps {
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

export default function AnnouncementsBoard(props: AnnouncementsBoardProps) {
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

  // Filter announcements based on expanded state
  const displayedAnnouncements = expandedAnnouncement
    ? announcements.filter(a => a._id === expandedAnnouncement)
    : announcements;

  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#0000FF]/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Pin className="h-8 w-8 text-[#FFD700]" />
          <h3 className="text-3xl font-black text-white">Announcements</h3>
        </div>
        <button
          onClick={onToggleNewAnnouncement}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5 text-white" />
          <span className="text-white font-bold">New</span>
        </button>
      </div>

      {showNewAnnouncement && (
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
      )}

      {announcements.length === 0 ? (
        <div className="text-center py-16">
          <Pin className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-[#87CEEB] text-lg font-semibold">No announcements yet</p>
          <p className="text-gray-400 mt-2">Create your first announcement to share with your team</p>
        </div>
      ) : (
        <div className={`grid ${expandedAnnouncement ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2`}>
          {displayedAnnouncements.map((announcement) => {
            const isExpanded = expandedAnnouncement === announcement._id;
            const isEditing = editingAnnouncement === announcement._id;
            
            return (
              <AnnouncementCard
                key={announcement._id}
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
            );
          })}
        </div>
      )}
    </div>
  );
}