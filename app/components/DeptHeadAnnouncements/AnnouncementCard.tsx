// app/components/DeptHeadAnnouncements/AnnouncementCard.tsx
'use client';

import React, { useState } from 'react';
import { Pin, Trash2, Edit2, Check, X, Maximize2, Minimize2, AlertCircle, Paperclip, MessageSquare, Send, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import { Announcement, Attachment, Comment } from './types';

interface AnnouncementCardProps {
  announcement: Announcement;
  isExpanded: boolean;
  isEditing: boolean;
  editTitle: string;
  editContent: string;
  editAttachments: Attachment[];
  newComment: string;
  onToggleExpand: () => void;
  onTogglePin?: () => void;
  onToggleUrgent?: () => void;
  onDelete?: () => void;
  onStartEdit?: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onEditAttachmentsChange: (attachments: Attachment[]) => void;
  onCommentChange: (comment: string) => void;
  onAddComment: () => void;
  onToggleCommentPin?: (commentId: string, currentPinned: boolean) => void;
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
  onToggleCommentPin,
}: AnnouncementCardProps) {
  const { colors, theme } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const contentLength = announcement.content?.length || 0;
  const isLongContent = contentLength > 150;

  // Use the announcement's custom color
  const announcementColor = announcement.color || '#2196F3';
  
  // Theme-aware text colors
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textSecondaryColor = theme === 'dark' ? 'text-white/90' : 'text-gray-800';
  const textMutedColor = theme === 'dark' ? 'text-white/80' : 'text-gray-700';
  const textLightColor = theme === 'dark' ? 'text-white/70' : 'text-gray-600';
  const textSubtleColor = theme === 'dark' ? 'text-white/60' : 'text-gray-500';
  
  // Button and input colors
  const buttonBg = theme === 'dark' ? 'bg-black/50' : 'bg-white/70';
  const buttonHoverBg = theme === 'dark' ? 'hover:bg-black/70' : 'hover:bg-white/90';
  const buttonBorder = theme === 'dark' ? 'border-white/20' : 'border-gray-300';
  const buttonHoverBorder = theme === 'dark' ? 'hover:border-white/40' : 'hover:border-gray-400';
  const iconColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
  
  const inputBg = theme === 'dark' ? 'bg-black/30' : 'bg-white/50';
  const inputBorder = theme === 'dark' ? 'border-white/20' : 'border-gray-300';
  const inputFocusBorder = theme === 'dark' ? 'focus:border-white/40' : 'focus:border-gray-500';
  const placeholderColor = theme === 'dark' ? 'placeholder-white/40' : 'placeholder-gray-500';

  return (
    <>
      <div
        className={`announcement-card relative rounded-xl transition-all duration-300 border-2 overflow-hidden group ${
          announcement.urgent ? 'urgent-pulse' : ''
        }`}
        style={{
          backgroundColor: `${announcementColor}${theme === 'dark' ? '20' : '15'}`,
          borderColor: announcementColor,
          ['--glow-color' as any]: announcementColor,
        }}
      >
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>

        {/* Internal glow effect on hover */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow: `inset 0 0 20px ${announcementColor}80, inset 0 0 40px ${announcementColor}40`
          }}
        ></div>

        <div className="relative p-4 z-10">
          {/* Header Actions */}
          <div className="flex justify-end gap-1.5 mb-3">
            {announcement.pinned && (
              <div 
                className="p-1 rounded-md border-2"
                style={{ 
                  backgroundColor: theme === 'dark' ? `${announcementColor}30` : `${announcementColor}40`,
                  borderColor: `${announcementColor}${theme === 'dark' ? '80' : 'CC'}`
                }}
              >
                <Pin className={`h-3 w-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} fill="currentColor" />
              </div>
            )}
            {announcement.urgent && (
              <div 
                className="px-1.5 py-0.5 rounded-md flex items-center gap-1 border-2"
                style={{
                  backgroundColor: theme === 'dark' ? '#EF5350' : '#F44336',
                  borderColor: theme === 'dark' ? '#FFCDD2' : '#FFEBEE'
                }}
              >
                <AlertCircle className="h-3 w-3 text-white" />
                <span className="text-[10px] font-black text-white">URGENT</span>
              </div>
            )}
            <button
              onClick={onToggleExpand}
              className={`p-1 ${buttonBg} ${buttonHoverBg} rounded-md transition-all backdrop-blur-sm border ${buttonBorder} ${buttonHoverBorder}`}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <Minimize2 className={`h-3 w-3 ${iconColor}`} />
              ) : (
                <Maximize2 className={`h-3 w-3 ${iconColor}`} />
              )}
            </button>
            {!isEditing && onStartEdit && (
              <>
                <button
                  onClick={onStartEdit}
                  className={`p-1 ${buttonBg} ${buttonHoverBg} rounded-md transition-all backdrop-blur-sm border ${buttonBorder} ${buttonHoverBorder}`}
                  title="Edit"
                >
                  <Edit2 className={`h-3 w-3 ${iconColor}`} />
                </button>
                {onTogglePin && (
                  <button
                    onClick={onTogglePin}
                    className={`p-1 ${buttonBg} ${buttonHoverBg} rounded-md transition-all backdrop-blur-sm border ${buttonBorder} ${buttonHoverBorder}`}
                    title={announcement.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className={`h-3 w-3 ${announcement.pinned ? 'text-[#FFD700]' : iconColor}`} />
                  </button>
                )}
                {onToggleUrgent && (
                  <button
                    onClick={onToggleUrgent}
                    className={`p-1 ${buttonBg} ${buttonHoverBg} rounded-md transition-all backdrop-blur-sm border ${buttonBorder} ${buttonHoverBorder}`}
                    title={announcement.urgent ? 'Mark as Normal' : 'Mark as Urgent'}
                  >
                    <AlertCircle className={`h-3 w-3 ${announcement.urgent ? 'text-[#FF0000]' : iconColor}`} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className={`p-1 ${buttonBg} hover:bg-red-500/70 rounded-md transition-all backdrop-blur-sm border ${buttonBorder} hover:border-red-500/60`}
                    title="Delete"
                  >
                    <Trash2 className={`h-3 w-3 ${iconColor}`} />
                  </button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={onSaveEdit}
                  className="p-1 bg-[#4CAF50]/50 hover:bg-[#4CAF50]/70 rounded-md transition-all backdrop-blur-sm border border-[#4CAF50]/60"
                  title="Save"
                >
                  <Check className="h-3 w-3 text-white" />
                </button>
                <button
                  onClick={onCancelEdit}
                  className="p-1 bg-[#FF0000]/50 hover:bg-[#FF0000]/70 rounded-md transition-all backdrop-blur-sm border border-[#FF0000]/60"
                  title="Cancel"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              className={`w-full ${inputBg} ${textColor} font-black text-base mb-2 p-2 rounded border ${inputBorder} ${inputFocusBorder} focus:outline-none backdrop-blur-sm`}
            />
          ) : (
            <h4 className={`text-base font-black ${textColor} mb-2 break-words`}>
              {announcement.title}
            </h4>
          )}

          {/* Content */}
          <div className="relative mb-3">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => onEditContentChange(e.target.value)}
                className={`w-full ${inputBg} ${textColor} font-semibold text-sm p-2 rounded border ${inputBorder} ${inputFocusBorder} focus:outline-none min-h-[100px] backdrop-blur-sm`}
              />
            ) : (
              <>
                <p className={`${textSecondaryColor} font-semibold leading-relaxed text-sm ${!isExpanded && isLongContent ? 'line-clamp-3' : 'whitespace-pre-wrap'}`}>
                  {announcement.content}
                </p>
                {isLongContent && !isExpanded && (
                  <button
                    onClick={onToggleExpand}
                    className="text-xs font-bold hover:opacity-80 transition-all mt-1.5 flex items-center gap-0.5"
                    style={{ color: announcementColor }}
                  >
                    Read More →
                  </button>
                )}
              </>
            )}
          </div>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="mb-3 space-y-1.5">
              <div className={`flex items-center gap-1.5 text-xs font-bold ${textMutedColor}`}>
                <Paperclip className="h-3 w-3" />
                Attachments ({announcement.attachments.length})
              </div>
              <div className={`grid ${isExpanded ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'} gap-1.5`}>
                {announcement.attachments.map((attachment, idx) => (
                  <div key={idx}>
                    {attachment.type === 'image' && isExpanded ? (
                      <div 
                        className="relative group/img cursor-pointer"
                        onClick={() => setSelectedImage(attachment.url)}
                      >
                        <img 
                          src={attachment.url} 
                          alt={attachment.name}
                          className={`w-full h-32 object-cover rounded-md border-2 ${buttonBorder} ${buttonHoverBorder} transition-all`}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-all rounded-md flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">Click to view</span>
                        </div>
                      </div>
                    ) : (
                      <a
                        href={attachment.url}
                        download={attachment.name}
                        className={`flex items-center gap-1.5 p-2 ${inputBg} hover:${theme === 'dark' ? 'bg-black/60' : 'bg-white/70'} rounded-md border ${buttonBorder} ${buttonHoverBorder} transition-all group/link backdrop-blur-sm`}
                      >
                        {attachment.type === 'image' ? (
                          <ImageIcon className={`h-4 w-4 ${iconColor}`} />
                        ) : (
                          <FileText className={`h-4 w-4 ${iconColor}`} />
                        )}
                        <span className={`text-xs ${textColor} flex-1 truncate font-semibold`}>{attachment.name}</span>
                        <span className={`text-[10px] ${textSubtleColor} mr-1.5`}>{formatFileSize(attachment.size)}</span>
                        <Download className={`h-3 w-3 ${textSubtleColor} group-hover/link:${textColor} transition-all`} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiration Date */}
          {announcement.expirationDate && (
            <div 
              className="mb-3 p-1.5 rounded-md border"
              style={{ 
                backgroundColor: `${announcementColor}${theme === 'dark' ? '20' : '30'}`,
                borderColor: `${announcementColor}${theme === 'dark' ? '60' : '80'}`
              }}
            >
              <p className="text-[10px] font-semibold" style={{ color: announcementColor }}>
                ⏰ Expires at 5:00 PM on {new Date(announcement.expirationDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          )}

          {/* Comments Section */}
          {isExpanded && (
            <div className={`mt-4 pt-4 border-t ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className={`h-4 w-4 ${iconColor}`} />
                <span className={`text-sm font-bold ${textColor}`}>
                  Comments ({announcement.comments?.length || 0})
                </span>
              </div>

              {/* Comments List */}
              {announcement.comments && announcement.comments.length > 0 && (
                <div className="space-y-2 mb-3">
                  {announcement.comments
                    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
                    .map((comment) => (
                      <div
                        key={comment._id}
                        className={`p-2 rounded-md ${
                          comment.pinned 
                            ? `${theme === 'dark' ? 'bg-[#FFD700]/20' : 'bg-[#FFD700]/30'} border ${theme === 'dark' ? 'border-[#FFD700]/40' : 'border-[#FFD700]/60'}` 
                            : `${inputBg} backdrop-blur-sm`
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className={`text-xs font-bold ${textColor}`}>{comment.author}</span>
                          {onToggleCommentPin && (
                            <div className="flex items-center gap-1">
                              {comment.pinned && (
                                <Pin className="h-2.5 w-2.5 text-[#FFD700]" fill="#FFD700" />
                              )}
                              <button
                                onClick={() => onToggleCommentPin(comment._id || '', comment.pinned || false)}
                                className={`p-0.5 hover:${theme === 'dark' ? 'bg-white/10' : 'bg-gray-200'} rounded`}
                                title={comment.pinned ? 'Unpin' : 'Pin'}
                              >
                                <Pin className={`h-2.5 w-2.5 ${comment.pinned ? 'text-[#FFD700]' : textSubtleColor}`} />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className={`text-xs ${textMutedColor} font-medium`}>{comment.text}</p>
                        <span className={`text-[10px] ${textSubtleColor} font-semibold`}>
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => onCommentChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onAddComment()}
                  placeholder="Add a comment..."
                  className={`flex-1 ${inputBg} ${textColor} text-xs font-semibold p-2 rounded border ${inputBorder} ${inputFocusBorder} focus:outline-none ${placeholderColor} backdrop-blur-sm`}
                />
                <button
                  onClick={onAddComment}
                  className={`p-2 ${buttonBg} ${buttonHoverBg} rounded border ${buttonBorder} ${buttonHoverBorder} transition-all`}
                  title="Send"
                >
                  <Send className={`h-3.5 w-3.5 ${iconColor}`} />
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={`mt-3 pt-2 border-t ${theme === 'dark' ? 'border-white/20' : 'border-gray-300'}`}>
            <div className="flex items-center justify-between">
              <p className={`text-[10px] ${textLightColor} font-bold`}>
                {new Date(announcement.createdAt).toLocaleDateString()}
              </p>
              {!isExpanded && (
                <div className={`flex items-center gap-1 ${textSubtleColor}`}>
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-[10px] font-semibold">{announcement.comments?.length || 0}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-3"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              <X className="h-5 w-5 text-white" />
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

      <style jsx>{`
        @keyframes urgent-pulse {
          0%, 100% {
            box-shadow: 0 0 20px var(--glow-color), inset 0 0 20px var(--glow-color);
          }
          50% {
            box-shadow: 0 0 40px var(--glow-color), inset 0 0 40px var(--glow-color);
          }
        }

        .announcement-card.urgent-pulse {
          animation: urgent-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}