// app/components/HRDownloadLogs/LogViewer.tsx
'use client';

import React from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Calendar, User, Pin, AlertTriangle, Trash2, Edit, Paperclip, FileText, Image, Download } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';

interface Attachment {
  _id?: string;
  name?: string;
  originalname?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  url?: string;
  path?: string;
}

interface Comment {
  _id: string;
  author: string;
  text: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  pinned?: boolean;
}

interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
  urgent?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  edited?: boolean;
  expirationDate?: string;
  comments?: Comment[];
  attachments?: Attachment[];
}

interface LogViewerProps {
  announcements: Announcement[];
  type: 'org' | 'dept';
  department?: string;
  startDate?: string;
  endDate?: string;
}

export default function LogViewer({ announcements, type, department, startDate, endDate }: LogViewerProps) {
  const { colors, cardCharacters } = useTheme();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-xl p-5 border-2 backdrop-blur-sm bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${colors.shadowCard}`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h2 className={`text-xl font-black ${cardCharacters.informative.text} mb-1`}>
            {type === 'org' ? 'Organization' : department} Announcements
          </h2>
          {startDate && endDate && (
            <p className={`text-xs ${colors.textMuted} font-semibold`}>
              Filtered: {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {sortedAnnouncements.length === 0 ? (
        <div className={`relative overflow-hidden rounded-xl p-8 border-2 text-center backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <p className={`relative ${colors.textMuted} text-sm font-semibold`}>
            {startDate && endDate 
              ? 'No announcements found in the selected date range'
              : 'No announcements found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedAnnouncements.map((announcement, idx) => {
            const isExpanded = expandedIds.has(announcement._id);
            const isExpired = announcement.expirationDate && new Date(announcement.expirationDate) < new Date();
            const activeComments = announcement.comments?.filter(c => !c.isDeleted).length || 0;
            const deletedComments = announcement.comments?.filter(c => c.isDeleted).length || 0;
            const sortedComments = announcement.comments 
              ? [...announcement.comments].sort((a, b) => 
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                )
              : [];

            return (
              <div 
                key={announcement._id}
                className={`group relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${cardCharacters.neutral.bg} ${cardCharacters.neutral.border} transition-all duration-300 ${colors.shadowCard} hover:${colors.shadowHover}`}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
                ></div>
                
                <button
                  onClick={() => toggleExpanded(announcement._id)}
                  className={`relative w-full p-4 text-left transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold ${colors.textMuted}`}>#{idx + 1}</span>
                        <h3 className={`text-base font-black ${colors.textPrimary}`}>{announcement.title}</h3>
                        
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {announcement.pinned && (
                            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.border} ${cardCharacters.interactive.text}`}>
                              <Pin className="h-3 w-3" />
                              PINNED
                            </span>
                          )}
                          {announcement.urgent && (
                            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} ${cardCharacters.urgent.text}`}>
                              <AlertTriangle className="h-3 w-3" />
                              URGENT
                            </span>
                          )}
                          {announcement.isDeleted && (
                            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border ${colors.border} ${colors.textMuted}`}>
                              <Trash2 className="h-3 w-3" />
                              DELETED
                            </span>
                          )}
                          {announcement.edited && (
                            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-bold border bg-gradient-to-r ${cardCharacters.informative.bg} ${cardCharacters.informative.border} ${cardCharacters.informative.text}`}>
                              <Edit className="h-3 w-3" />
                              EDITED
                            </span>
                          )}
                          {isExpired && (
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.border} ${cardCharacters.interactive.text}`}>
                              EXPIRED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`flex items-center gap-3 text-xs ${colors.textMuted} font-medium`}>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {announcement.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(announcement.createdAt)}
                        </span>
                        {announcement.comments && announcement.comments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {announcement.comments.length}
                          </span>
                        )}
                        {announcement.attachments && announcement.attachments.length > 0 && (
                          <span className={`flex items-center gap-1 ${cardCharacters.interactive.text}`}>
                            <Paperclip className="h-3 w-3" />
                            {announcement.attachments.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className={`h-5 w-5 ${colors.textMuted} flex-shrink-0 transition-transform duration-300`} />
                    ) : (
                      <ChevronDown className={`h-5 w-5 ${colors.textMuted} flex-shrink-0 transition-transform duration-300`} />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className={`relative px-4 pb-4 space-y-3 border-t ${colors.border}`}>
                    <div className="pt-3 space-y-2 text-xs">
                      {announcement.expirationDate && (
                        <div className="flex items-start gap-2">
                          <span className={`font-bold ${colors.textMuted}`}>Expiration:</span>
                          <span className={isExpired ? cardCharacters.interactive.text : colors.textSecondary}>
                            {formatDate(announcement.expirationDate)}
                            {isExpired && ' [EXPIRED]'}
                          </span>
                        </div>
                      )}
                      {announcement.isDeleted && announcement.deletedAt && (
                        <div className="flex items-start gap-2">
                          <span className={`font-bold ${colors.textMuted}`}>Deleted:</span>
                          <span className={colors.textSecondary}>{formatDate(announcement.deletedAt)}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className={`text-xs font-bold ${colors.textMuted} mb-2`}>Content:</p>
                      <div className={`p-3 rounded-lg border ${colors.inputBg} ${colors.border}`}>
                        <p className={`${colors.textSecondary} text-xs whitespace-pre-wrap`}>{announcement.content}</p>
                      </div>
                    </div>

                    {announcement.attachments && announcement.attachments.length > 0 && (
                      <div>
                        <p className={`text-xs font-bold ${colors.textMuted} mb-2 flex items-center gap-2`}>
                          <Paperclip className={`h-3 w-3 ${cardCharacters.interactive.iconColor}`} />
                          Attachments ({announcement.attachments.length})
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {announcement.attachments.map((attachment, aidx) => {
                            const isImage = attachment.mimetype?.startsWith('image/');
                            const fileName = attachment.originalname || attachment.name || attachment.filename || 'Unknown file';
                            const fileUrl = attachment.url || attachment.path;
                            
                            return (
                              <div 
                                key={aidx}
                                className={`relative overflow-hidden p-3 rounded-lg border-2 backdrop-blur-sm bg-gradient-to-br ${cardCharacters.interactive.bg} ${cardCharacters.interactive.border}`}
                              >
                                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                                <div className="relative flex items-start gap-2">
                                  {isImage ? (
                                    <Image className={`h-4 w-4 ${cardCharacters.interactive.iconColor} flex-shrink-0 mt-0.5`} />
                                  ) : (
                                    <FileText className={`h-4 w-4 ${cardCharacters.interactive.iconColor} flex-shrink-0 mt-0.5`} />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={`font-bold ${colors.textPrimary} text-xs truncate`}>
                                      {fileName}
                                    </p>
                                    <p className={`text-xs ${colors.textMuted} mt-0.5`}>
                                      {attachment.mimetype || 'Unknown type'} • {formatFileSize(attachment.size)}
                                    </p>
                                    {fileUrl && (
                                      <a
                                        href={fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`inline-flex items-center gap-1 mt-2 text-xs font-bold ${cardCharacters.interactive.text} hover:${cardCharacters.interactive.accent} transition-colors`}
                                      >
                                        <Download className="h-3 w-3" />
                                        Download
                                      </a>
                                    )}
                                    {isImage && fileUrl && (
                                      <img 
                                        src={fileUrl} 
                                        alt={fileName}
                                        className={`mt-2 rounded-md max-w-full h-auto border-2 ${cardCharacters.interactive.border}`}
                                        style={{ maxHeight: '150px' }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {sortedComments.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className={`text-xs font-bold ${colors.textMuted}`}>
                            Comments ({sortedComments.length} total - {activeComments} active, {deletedComments} deleted)
                          </p>
                        </div>
                        <div className="space-y-2">
                          {sortedComments.map((comment, cidx) => (
                            <div 
                              key={comment._id}
                              className={`relative overflow-hidden p-3 rounded-lg border-2 backdrop-blur-sm ${
                                comment.isDeleted 
                                  ? `bg-gradient-to-br ${colors.cardBg} ${colors.border}` 
                                  : `bg-gradient-to-br ${cardCharacters.informative.bg} ${cardCharacters.informative.border}`
                              }`}
                            >
                              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                              <div className="relative flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-xs font-bold ${colors.textMuted}`}>#{cidx + 1}</span>
                                  <span className={`font-bold ${colors.textPrimary} text-xs`}>{comment.author}</span>
                                  {comment.pinned && (
                                    <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold border bg-gradient-to-r ${cardCharacters.interactive.bg} ${cardCharacters.interactive.border} ${cardCharacters.interactive.text}`}>
                                      <Pin className="h-2.5 w-2.5" />
                                      PINNED
                                    </span>
                                  )}
                                  {comment.isDeleted && (
                                    <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold border ${colors.border} ${colors.textMuted}`}>
                                      <Trash2 className="h-2.5 w-2.5" />
                                      DELETED
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className={`relative text-xs ${colors.textMuted} mb-2`}>
                                Posted: {formatDate(comment.createdAt)}
                                {comment.isDeleted && comment.deletedAt && (
                                  <> • Deleted: {formatDate(comment.deletedAt)}</>
                                )}
                              </p>
                              
                              <p className={`relative text-xs ${colors.textSecondary}`}>{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}