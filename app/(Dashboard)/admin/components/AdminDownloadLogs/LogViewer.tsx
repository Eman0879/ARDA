// app/(Dashboard)/admin/components/AdminDownloadLogs/LogViewer.tsx
'use client';

import React from 'react';
import { ChevronDown, ChevronUp, MessageSquare, Calendar, User, Pin, AlertTriangle, Trash2, Edit } from 'lucide-react';

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
}

interface LogViewerProps {
  announcements: Announcement[];
  type: 'org' | 'dept';
  department?: string;
}

export default function LogViewer({ announcements, type, department }: LogViewerProps) {
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

  const totalComments = announcements.reduce((sum, ann) => 
    sum + (ann.comments?.length || 0), 0
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

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#0000FF]/40">
        <h2 className="text-2xl font-black text-white mb-4">
          {type === 'org' ? 'Organization' : department} Announcements
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#0000FF]/10 border border-[#0000FF]/30 rounded-xl">
            <p className="text-sm text-gray-400 font-semibold">Total Announcements</p>
            <p className="text-3xl font-black text-white mt-1">{announcements.length}</p>
          </div>
          <div className="p-4 bg-[#87CEEB]/10 border border-[#87CEEB]/30 rounded-xl">
            <p className="text-sm text-gray-400 font-semibold">Total Comments</p>
            <p className="text-3xl font-black text-white mt-1">{totalComments}</p>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      {sortedAnnouncements.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-gray-700/40 text-center">
          <p className="text-gray-400 font-semibold">No announcements found</p>
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
                className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-xl border-2 border-gray-700/40 overflow-hidden transition-all duration-300 hover:border-[#0000FF]/60"
              >
                {/* Announcement Header */}
                <button
                  onClick={() => toggleExpanded(announcement._id)}
                  className="w-full p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold text-gray-500">#{idx + 1}</span>
                        <h3 className="text-lg font-black text-white">{announcement.title}</h3>
                        
                        {/* Status Badges */}
                        <div className="flex items-center gap-2">
                          {announcement.pinned && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded text-xs font-bold text-yellow-400">
                              <Pin className="h-3 w-3" />
                              PINNED
                            </span>
                          )}
                          {announcement.urgent && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-500/40 rounded text-xs font-bold text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                              URGENT
                            </span>
                          )}
                          {announcement.isDeleted && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 border border-gray-500/40 rounded text-xs font-bold text-gray-400">
                              <Trash2 className="h-3 w-3" />
                              DELETED
                            </span>
                          )}
                          {announcement.edited && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-500/40 rounded text-xs font-bold text-blue-400">
                              <Edit className="h-3 w-3" />
                              EDITED
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/40 rounded text-xs font-bold text-orange-400">
                              EXPIRED
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {announcement.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(announcement.createdAt)}
                        </span>
                        {announcement.comments && announcement.comments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {announcement.comments.length} comment{announcement.comments.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-4 border-t border-gray-700/40">
                    {/* Metadata */}
                    <div className="pt-4 space-y-2 text-sm">
                      {announcement.expirationDate && (
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-400">Expiration:</span>
                          <span className={isExpired ? 'text-orange-400 font-semibold' : 'text-gray-300'}>
                            {formatDate(announcement.expirationDate)}
                            {isExpired && ' [EXPIRED]'}
                          </span>
                        </div>
                      )}
                      {announcement.isDeleted && announcement.deletedAt && (
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-400">Deleted:</span>
                          <span className="text-gray-300">{formatDate(announcement.deletedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <p className="text-sm font-bold text-gray-400 mb-2">Content:</p>
                      <div className="p-4 bg-black/40 border border-gray-700/40 rounded-lg">
                        <p className="text-gray-200 whitespace-pre-wrap">{announcement.content}</p>
                      </div>
                    </div>

                    {/* Comments */}
                    {sortedComments.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold text-gray-400">
                            Comments ({sortedComments.length} total - {activeComments} active, {deletedComments} deleted)
                          </p>
                        </div>
                        <div className="space-y-3">
                          {sortedComments.map((comment, cidx) => (
                            <div 
                              key={comment._id}
                              className={`p-4 rounded-lg border ${
                                comment.isDeleted 
                                  ? 'bg-gray-800/40 border-gray-700/40' 
                                  : 'bg-[#0000FF]/5 border-[#0000FF]/20'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-gray-500">#{cidx + 1}</span>
                                  <span className="font-bold text-white">{comment.author}</span>
                                  {comment.pinned && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 rounded text-xs font-bold text-yellow-400">
                                      <Pin className="h-3 w-3" />
                                      PINNED
                                    </span>
                                  )}
                                  {comment.isDeleted && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 border border-gray-500/40 rounded text-xs font-bold text-gray-400">
                                      <Trash2 className="h-3 w-3" />
                                      DELETED
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-400 mb-2">
                                Posted: {formatDate(comment.createdAt)}
                                {comment.isDeleted && comment.deletedAt && (
                                  <> • Deleted: {formatDate(comment.deletedAt)}</>
                                )}
                              </p>
                              
                              <p className="text-sm text-gray-200">{comment.text}</p>
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