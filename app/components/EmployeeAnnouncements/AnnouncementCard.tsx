// app/components/EmployeeAnnouncements/AnnouncementCard.tsx
'use client';

import React, { useState } from 'react';
import { Pin, MessageSquare, Maximize2, Minimize2, AlertCircle, Paperclip, Download, FileText, Image as ImageIcon, X } from 'lucide-react';

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

interface AnnouncementCardProps {
  announcement: Announcement;
  isExpanded: boolean;
  newComment: string;
  onToggleExpand: () => void;
  onCommentChange: (comment: string) => void;
  onAddComment: () => void;
}

export default function AnnouncementCard({
  announcement,
  isExpanded,
  newComment,
  onToggleExpand,
  onCommentChange,
  onAddComment
}: AnnouncementCardProps) {
  const borderColor = announcement.color;
  const contentLength = announcement.content?.length || 0;
  const isLongContent = contentLength > 1;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        className={`announcement-card relative p-4 rounded-lg transition-all duration-300 border-2 overflow-hidden ${
          isExpanded ? 'col-span-full' : ''
        } ${announcement.urgent ? 'urgent-glow' : ''}`}
        style={{
          backgroundColor: announcement.color + '20',
          borderColor: borderColor,
          ['--glow-color' as any]: borderColor
        }}
      >
        {/* Header Badges */}
        <div className="flex justify-end gap-1.5 mb-3">
          {announcement.urgent && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#FF0000] rounded-md border border-white/50">
              <AlertCircle className="h-2.5 w-2.5 text-white" />
              <span className="text-xs font-black text-white">URGENT</span>
            </div>
          )}
          {announcement.pinned && !announcement.urgent && (
            <div className="p-1 bg-[#FFD700]/70 rounded-md border border-white/50 dark:border-white/50 light:border-gray-300">
              <Pin className="h-3 w-3 text-white dark:text-white light:text-gray-900" fill="white" />
            </div>
          )}
          <button
            onClick={onToggleExpand}
            className="p-1 bg-black/50 dark:bg-black/50 light:bg-white/80 hover:bg-black/70 dark:hover:bg-black/70 light:hover:bg-gray-100 rounded-md transition-all backdrop-blur-sm border border-white/20 dark:border-white/20 light:border-gray-300 hover:border-white/40 dark:hover:border-white/40 light:hover:border-gray-400"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3 text-white dark:text-white light:text-gray-900" />
            ) : (
              <Maximize2 className="h-3 w-3 text-white dark:text-white light:text-gray-900" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <h4 className="text-base font-black text-white dark:text-white light:text-gray-900 break-words">{announcement.title}</h4>
          {announcement.edited && (
            <span className="px-1.5 py-0.5 bg-white/20 dark:bg-white/20 light:bg-gray-200 rounded text-xs font-bold text-white/80 dark:text-white/80 light:text-gray-700 flex-shrink-0">
              EDITED
            </span>
          )}
        </div>

        {/* Content with fade and read more */}
        <div className="relative mb-1.5">
          <div className="relative">
            <p className={`text-white/90 dark:text-white/90 light:text-gray-700 text-sm font-semibold leading-relaxed select-none ${!isExpanded && isLongContent ? 'line-clamp-1' : 'whitespace-pre-wrap'}`}>
              {announcement.content}
            </p>
          </div>
          {isLongContent && !isExpanded && (
            <button
              onClick={onToggleExpand}
              className="text-xs font-bold hover:opacity-80 transition-all mt-1.5 flex items-center gap-1"
              style={{ color: borderColor }}
            >
              Read More →
            </button>
          )}
        </div>

        {/* Attachments Display */}
        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white/80 dark:text-white/80 light:text-gray-700">
              <Paperclip className="h-3 w-3" />
              Attachments ({announcement.attachments.length})
            </div>
            <div className={`grid ${isExpanded ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
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
                        className="w-full h-32 object-cover rounded-md border-2 border-white/20 dark:border-white/20 light:border-gray-300 hover:border-white/40 dark:hover:border-white/40 light:hover:border-gray-400 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all rounded-md flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">Click to view</span>
                      </div>
                    </div>
                  ) : (
                    <a
                      href={attachment.url}
                      download={attachment.name}
                      className="flex items-center gap-1.5 p-2 bg-black/40 dark:bg-black/40 light:bg-white/80 hover:bg-black/60 dark:hover:bg-black/60 light:hover:bg-gray-100 rounded-md border border-white/20 dark:border-white/20 light:border-gray-300 hover:border-white/40 dark:hover:border-white/40 light:hover:border-gray-400 transition-all group"
                    >
                      {attachment.type === 'image' ? (
                        <ImageIcon className="h-3.5 w-3.5 text-[#87CEEB] dark:text-[#87CEEB] light:text-[#0000FF]" />
                      ) : (
                        <FileText className="h-3.5 w-3.5 text-[#87CEEB] dark:text-[#87CEEB] light:text-[#0000FF]" />
                      )}
                      <span className="text-xs text-white dark:text-white light:text-gray-900 flex-1 truncate font-semibold">{attachment.name}</span>
                      <Download className="h-3 w-3 text-white/60 dark:text-white/60 light:text-gray-600 group-hover:text-white dark:group-hover:text-white light:group-hover:text-gray-900 transition-all" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-white/20 dark:border-white/20 light:border-gray-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/70 dark:text-white/70 light:text-gray-600 font-bold">
              {new Date(announcement.createdAt).toLocaleDateString()}
            </p>
            <div 
              onClick={onToggleExpand}
              className="flex items-center gap-1.5 text-xs font-bold text-white/70 dark:text-white/70 light:text-gray-600 cursor-pointer hover:text-white/90 dark:hover:text-white/90 light:hover:text-gray-900 transition-colors"
              title="Click to view comments"
            >
              <MessageSquare className="h-3 w-3" />
              <span>{announcement.comments?.length || 0} comments</span>
            </div>
          </div>

          {/* Comments Section */}
          {isExpanded && (
            <div className="mt-3 space-y-2">
              <h5 className="text-xs font-black text-white dark:text-white light:text-gray-900 mb-2">Comments Thread</h5>
              
              {/* Existing Comments */}
              {announcement.comments && announcement.comments.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {announcement.comments
                    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                    .map((comment, idx) => (
                    <div key={idx} className="bg-black/50 dark:bg-black/50 light:bg-white/80 backdrop-blur-sm p-2.5 rounded-md border border-white/20 dark:border-white/20 light:border-gray-300 relative">
                      {comment.pinned && (
                        <Pin className="absolute top-1.5 right-1.5 h-2.5 w-2.5 text-white dark:text-white light:text-gray-900" fill="white" />
                      )}
                      <div className="flex items-center justify-between mb-1.5 pr-5">
                        <p className="text-xs font-black text-white dark:text-white light:text-gray-900">{comment.author}</p>
                        <p className="text-xs text-white/60 dark:text-white/60 light:text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-white/90 dark:text-white/90 light:text-gray-700 leading-relaxed">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-black/40 dark:bg-black/40 light:bg-gray-100 backdrop-blur-sm rounded-md border border-white/20 dark:border-white/20 light:border-gray-300">
                  <MessageSquare className="h-6 w-6 text-white/50 dark:text-white/50 light:text-gray-400 mx-auto mb-1.5" />
                  <p className="text-xs text-white/70 dark:text-white/70 light:text-gray-600">No comments yet. Be the first to comment!</p>
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-1.5 mt-3">
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
                  className="flex-1 px-3 py-2 bg-black/40 dark:bg-black/40 light:bg-white/80 backdrop-blur-sm border border-white/30 dark:border-white/30 light:border-gray-300 rounded-md text-white dark:text-white light:text-gray-900 text-sm placeholder-white/50 dark:placeholder-white/50 light:placeholder-gray-500 focus:outline-none focus:border-white/60 dark:focus:border-white/60 light:focus:border-gray-400"
                />
                <button
                  onClick={onAddComment}
                  className="px-4 py-2 bg-black/50 dark:bg-black/50 light:bg-white/80 hover:bg-black/70 dark:hover:bg-black/70 light:hover:bg-gray-100 backdrop-blur-sm rounded-md text-white dark:text-white light:text-gray-900 text-sm font-bold transition-all border border-white/30 dark:border-white/30 light:border-gray-300 hover:border-white/50 dark:hover:border-white/50 light:hover:border-gray-400"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[85vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-all"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <img 
              src={selectedImage} 
              alt="Full size"
              className="max-w-full max-h-[85vh] object-contain rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}