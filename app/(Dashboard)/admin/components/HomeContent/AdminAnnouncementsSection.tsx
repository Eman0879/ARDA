// app/(Dashboard)/admin/components/HomeContent/AdminAnnouncementsSection.tsx
'use client';

import React from 'react';
import { Shield, Plus, X, Pin, Edit2, Check, Maximize2, Minimize2 } from 'lucide-react';

interface AdminAnnouncement {
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
  edited?: boolean;
}

interface AdminAnnouncementsSectionProps {
  announcements: AdminAnnouncement[];
  showNewForm: boolean;
  newTitle: string;
  newContent: string;
  editingId: string | null;
  editTitle: string;
  editContent: string;
  onToggleForm: () => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onPost: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onStartEdit: (announcement: AdminAnnouncement) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
}

export default function AdminAnnouncementsSection({
  announcements,
  showNewForm,
  newTitle,
  newContent,
  editingId,
  editTitle,
  editContent,
  onToggleForm,
  onTitleChange,
  onContentChange,
  onPost,
  onCancel,
  onDelete,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditTitleChange,
  onEditContentChange,
  onTogglePin
}: AdminAnnouncementsSectionProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#FFD700]/40">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#FFD700]" />
          <h3 className="text-3xl font-black text-white">Admin Announcements</h3>
          <span className="px-3 py-1 bg-[#FFD700]/20 rounded-lg text-[#FFD700] text-xs font-bold">
            ADMINS ONLY
          </span>
        </div>
        <button
          onClick={onToggleForm}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="h-5 w-5 text-white" />
          <span className="text-white font-bold">New</span>
        </button>
      </div>

      {/* New Announcement Form */}
      {showNewForm && (
        <div className="mb-6 p-6 bg-gray-900/60 rounded-xl border-2 border-[#0000FF]/40">
          <input
            type="text"
            placeholder="Announcement Title"
            value={newTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full mb-4 px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0000FF]"
          />
          <textarea
            placeholder="Announcement Content"
            value={newContent}
            onChange={(e) => onContentChange(e.target.value)}
            rows={3}
            className="w-full mb-4 px-4 py-3 bg-gray-800/60 border-2 border-[#000080]/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#0000FF] resize-none"
          />
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onPost}
              className="px-6 py-2 bg-gradient-to-r from-[#0000FF] to-[#6495ED] hover:from-[#6495ED] hover:to-[#0000FF] rounded-lg text-white font-bold transition-all"
            >
              Post
            </button>
          </div>
        </div>
      )}

      {/* Announcements Horizontal Scroll */}
      {announcements.length === 0 ? (
        <div className="text-center py-12">
          <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-[#87CEEB] text-lg font-semibold">No admin announcements yet</p>
          <p className="text-gray-400 mt-2">Create announcements visible only to admins</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {announcements
            .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
            .map((announcement) => {
              const isEditing = editingId === announcement._id;
              const isExpanded = expandedId === announcement._id;
              const contentLength = announcement.content?.length || 0;
              const isLongContent = contentLength > 1;
              
              return (
                <div
                  key={announcement._id}
                  className={`admin-announcement-card relative rounded-xl transition-all duration-300 border-2 overflow-hidden flex-shrink-0 ${
                    isExpanded ? 'w-[832px]' : 'w-[400px]'
                  }`}
                  style={{
                    backgroundColor: 'rgba(255, 215, 0, 0.15)',
                    borderColor: '#FFD700'
                  }}
                >
                  <div className="relative p-6 h-full">
                    {/* Header with Controls */}
                    <div className="flex justify-end gap-2 mb-4">
                      {announcement.pinned && (
                        <div className="p-1.5 bg-[#FFD700]/70 rounded-lg border border-white/50">
                          <Pin className="h-4 w-4 text-white" fill="white" />
                        </div>
                      )}
                      <button
                        onClick={() => onTogglePin(announcement._id, announcement.pinned || false)}
                        className={`p-1.5 rounded-lg transition-all backdrop-blur-sm border ${
                          announcement.pinned 
                            ? 'bg-[#FFD700]/70 border-white/50 hover:bg-[#FFD700]/90' 
                            : 'bg-black/50 hover:bg-black/70 border-white/20 hover:border-white/40'
                        }`}
                        title="Toggle Pin"
                      >
                        <Pin className="h-4 w-4 text-white" />
                      </button>
                      {!isEditing && (
                        <button
                          onClick={() => onStartEdit(announcement)}
                          className="p-1.5 bg-black/50 hover:bg-black/70 rounded-lg transition-all backdrop-blur-sm border border-white/20 hover:border-white/40"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-white" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : announcement._id)}
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
                        onClick={() => onDelete(announcement._id)}
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => onSaveEdit(announcement._id)}
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
                        
                        {/* Content with fade and read more */}
                        <div className="relative mb-2">
                          <div className="relative">
                            <p className={`text-white/90 font-semibold leading-relaxed select-none ${!isExpanded && isLongContent ? 'line-clamp-1' : 'whitespace-pre-wrap'}`}>
                              {announcement.content}
                            </p>
                          </div>
                          {isLongContent && !isExpanded && (
                            <button
                              onClick={() => setExpandedId(announcement._id)}
                              className="text-sm font-bold hover:opacity-80 transition-all mt-2 flex items-center gap-1 text-[#FFD700]"
                            >
                              Read More →
                            </button>
                          )}
                        </div>
                      </>
                    )}
                    
                    {!isEditing && (
                      <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-white/70 font-bold">
                            {new Date(announcement.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-white/60 font-semibold">
                            By: {announcement.author}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      )}

      <style jsx>{`
        @keyframes admin-pulse {
          0%, 100% {
            box-shadow: inset 0 0 20px -3px #FFD700;
          }
          50% {
            box-shadow: inset 0 0 40px 0px #FFD700;
          }
        }

        .admin-announcement-card {
          animation: admin-pulse 3s ease-in-out infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 128, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #0000FF, #6495ED);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #6495ED, #0000FF);
        }
      `}</style>
    </div>
  );
}