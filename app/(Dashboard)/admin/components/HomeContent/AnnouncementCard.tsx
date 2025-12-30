// app/(Dashboard)/dept-head/components/HomeContent/AnnouncementCard.tsx
'use client';

import React, { useState } from 'react';
import { Pin, X, AlertCircle, Maximize2, Minimize2, MessageSquare, Edit2, Check, Paperclip, Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { Announcement, Attachment } from './types';

interface AnnouncementCardProps {
  announcement: Announcement;
  isExpanded: boolean;
  isEditing: boolean;
  editTitle: string;
  editContent: string;
  editAttachments: Attachment[];
  newComment: string;
  onToggleExpand: () => void;
  onTogglePin: () => void;
  onToggleUrgent: () => void;
  onDelete: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onEditAttachmentsChange: (attachments: Attachment[]) => void;
  onCommentChange: (comment: string) => void;
  onAddComment: () => void;
  onToggleCommentPin: (commentId: string, currentPinned: boolean) => void;
}

export default function AnnouncementCard({
  announcement,
  isExpanded,
  isEditing,
  editTitle,
  editContent,
  editAttachments,
  newComment,
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
}: AnnouncementCardProps) {
  const borderColor = announcement.color;
  const contentLength = announcement.content?.length || 0;
  const isLongContent = contentLength > 1;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment: Attachment = {
          name: file.name,
          url: event.target?.result as string,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          size: file.size,
          uploadedAt: new Date().toISOString()
        };
        onEditAttachmentsChange([...editAttachments, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    onEditAttachmentsChange(editAttachments.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <div
        className={`announcement-card relative p-6 rounded-xl transition-all duration-300 border-2 overflow-hidden ${
          isExpanded ? 'col-span-full' : ''
        } ${announcement.urgent ? 'urgent-glow' : ''}`}
        style={{
          backgroundColor: announcement.color + '20',
          borderColor: borderColor,
          ['--glow-color' as any]: borderColor
        }}
      >
        {/* Header with Controls */}
        <div className="flex justify-end gap-2 mb-4">
          {announcement.urgent && (
            <div className="flex items-center gap-1 px-2 py-1 bg-[#FF0000] rounded-lg border border-white/50">
              <AlertCircle className="h-3 w-3 text-white" />
              <span className="text-xs font-black text-white">URGENT</span>
            </div>
          )}
          {announcement.pinned && !announcement.urgent && (
            <div className="p-1.5 bg-[#FFD700]/70 rounded-lg border border-white/50">
              <Pin className="h-4 w-4 text-white" fill="white" />
            </div>
          )}
          <button
            onClick={onToggleUrgent}
            className={`p-1.5 rounded-lg transition-all backdrop-blur-sm border ${
              announcement.urgent 
                ? 'bg-[#FF0000]/70 border-white/50 hover:bg-[#FF0000]/90' 
                : 'bg-black/50 hover:bg-black/70 border-white/20 hover:border-white/40'
            }`}
            title="Toggle Urgent"
          >
            <AlertCircle className="h-4 w-4 text-white" />
          </button>
          {!announcement.urgent && (
            <button
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition-all backdrop-blur-sm border ${
                announcement.pinned 
                  ? 'bg-[#FFD700]/70 border-white/50 hover:bg-[#FFD700]/90' 
                  : 'bg-black/50 hover:bg-black/70 border-white/20 hover:border-white/40'
              }`}
              title="Toggle Pin"
            >
              <Pin className="h-4 w-4 text-white" />
            </button>
          )}
          {!isEditing && (
            <button
              onClick={onStartEdit}
              className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/40"
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-white" />
            </button>
          )}
          <button
            onClick={onToggleExpand}
            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/40"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4 text-white" />
            ) : (
              <Maximize2 className="h-4 w-4 text-white" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/40"
            title="Delete"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        {isEditing ? (
          <>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className="w-full mb-3 px-3 py-2 bg-black/40 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/60 font-black text-xl"
            />
            <textarea
              value={editContent}
              onChange={(e) => onEditContentChange(e.target.value)}
              rows={4}
              className="w-full mb-4 px-3 py-2 bg-black/40 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/60 font-semibold resize-none"
            />
            
            {/* Attachment Upload */}
            <div className="mb-4">
              <label className="flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-black/60 border border-white/30 rounded-lg text-white font-semibold cursor-pointer transition-all w-fit">
                <Paperclip className="h-4 w-4" />
                Add Attachments
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {editAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {editAttachments.map((attachment, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-black/40 rounded-lg border border-white/20">
                      {attachment.type === 'image' ? (
                        <ImageIcon className="h-4 w-4 text-[#87CEEB]" />
                      ) : (
                        <FileText className="h-4 w-4 text-[#87CEEB]" />
                      )}
                      <span className="text-sm text-white flex-1 truncate">{attachment.name}</span>
                      <span className="text-xs text-white/60">{formatFileSize(attachment.size)}</span>
                      <button
                        onClick={() => removeAttachment(idx)}
                        className="p-1 hover:bg-red-500/50 rounded transition-all"
                      >
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onSaveEdit}
                className="flex items-center gap-2 px-4 py-2 bg-[#0000FF] hover:bg-[#6495ED] rounded-lg text-white font-bold transition-all"
              >
                <Check className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-xl font-black text-white break-words">{announcement.title}</h4>
              {announcement.edited && (
                <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-bold text-white/80 flex-shrink-0">
                  EDITED
                </span>
              )}
            </div>
            
            <div className="relative mb-2">
              <div className="relative">
                <p className={`text-white/90 font-semibold leading-relaxed select-none ${!isExpanded && isLongContent ? 'line-clamp-1' : 'whitespace-pre-wrap'}`}>
                  {announcement.content}
                </p>
              </div>
              {isLongContent && !isExpanded && (
                <button
                  onClick={onToggleExpand}
                  className="text-sm font-bold hover:opacity-80 transition-all mt-2 flex items-center gap-1"
                  style={{ color: borderColor }}
                >
                  Read More →
                </button>
              )}
            </div>

            {/* Attachments Display */}
            {announcement.attachments && announcement.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-white/80">
                  <Paperclip className="h-4 w-4" />
                  Attachments ({announcement.attachments.length})
                </div>
                <div className={`grid ${isExpanded ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-2`}>
                  {announcement.attachments.map((attachment, idx) => (
                    <div key={idx}>
                      {attachment.type === 'image' && isExpanded ? (
                        <div 
                          className="relative group cursor-pointer"
                          onClick={() => setSelectedImage(attachment.url)}
                        >
                          <img 
                            src={attachment.url} 
                            alt={attachment.name}
                            className="w-full h-48 object-cover rounded-lg border-2 border-white/20 hover:border-white/40 transition-all"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold">Click to view</span>
                          </div>
                        </div>
                      ) : (
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className="flex items-center gap-2 p-3 bg-black/40 hover:bg-black/60 rounded-lg border border-white/20 hover:border-white/40 transition-all group"
                        >
                          {attachment.type === 'image' ? (
                            <ImageIcon className="h-5 w-5 text-[#87CEEB]" />
                          ) : (
                            <FileText className="h-5 w-5 text-[#87CEEB]" />
                          )}
                          <span className="text-sm text-white flex-1 truncate font-semibold">{attachment.name}</span>
                          <Download className="h-4 w-4 text-white/60 group-hover:text-white transition-all" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        
        {!isEditing && (
          <div className="mt-4 pt-3 border-t border-white/20">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/70 font-bold">
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
              <div 
                onClick={onToggleExpand}
                className="flex items-center gap-2 text-xs font-bold text-white/70 cursor-pointer hover:text-white/90 transition-colors"
                title="Click to view comments"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{announcement.comments?.length || 0} comments</span>
              </div>
            </div>

            {/* Comments Section */}
            {isExpanded && (
              <div className="mt-4 space-y-3">
                <h5 className="text-sm font-black text-white mb-3">Comments Thread</h5>
                
                {announcement.comments && announcement.comments.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {announcement.comments
                      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                      .map((comment, idx) => (
                      <div key={idx} className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/20 relative">
                        {comment.pinned && (
                          <Pin className="absolute top-2 right-2 h-3 w-3 text-white" fill="white" />
                        )}
                        <div className="flex items-center justify-between mb-2 pr-6">
                          <p className="text-sm font-black text-white">{comment.author}</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onToggleCommentPin(comment._id!, comment.pinned || false)}
                              className={`p-1 rounded transition-all ${
                                comment.pinned 
                                  ? 'bg-[#FFD700]/50' 
                                  : 'hover:bg-white/20'
                              }`}
                              title="Toggle Pin Comment"
                            >
                              <Pin className="h-3 w-3 text-white" />
                            </button>
                            <p className="text-xs text-white/60">
                              {new Date(comment.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-white/90 leading-relaxed">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-black/40 backdrop-blur-sm rounded-lg border border-white/20">
                    <MessageSquare className="h-8 w-8 text-white/50 mx-auto mb-2" />
                    <p className="text-sm text-white/70">No comments yet. Be the first to comment!</p>
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex gap-2 mt-4">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        onAddComment();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-black/40 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/60"
                  />
                  <button
                    onClick={onAddComment}
                    className="px-6 py-3 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg text-white font-bold transition-all border border-white/30 hover:border-white/50"
                  >
                    Post
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}