// app/(Dashboard)/hr-head/components/HomeContent/OrgAnnouncementsSection.tsx
'use client';

import React, { useState } from 'react';
import { Globe, Plus, X, Pin, Edit2, Check, Maximize2, Minimize2, Paperclip, Download, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { OrgAnnouncement, Attachment } from './types';
import OrgAnnouncementForm from './OrgAnnouncementForm';

interface OrgAnnouncementsSectionProps {
  announcements: OrgAnnouncement[];
  showNewForm: boolean;
  newTitle: string;
  newContent: string;
  expirationDate: string;
  newAttachments: Attachment[];
  editingId: string | null;
  editTitle: string;
  editContent: string;
  editAttachments: Attachment[];
  onToggleForm: () => void;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onExpirationDateChange: (date: string) => void;
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onPost: () => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
  onStartEdit: (announcement: OrgAnnouncement) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditTitleChange: (title: string) => void;
  onEditContentChange: (content: string) => void;
  onEditAttachmentsChange: (attachments: Attachment[]) => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
}

export default function OrgAnnouncementsSection(props: OrgAnnouncementsSectionProps) {
  const {
    announcements,
    showNewForm,
    newTitle,
    newContent,
    expirationDate,
    newAttachments,
    editingId,
    editTitle,
    editContent,
    editAttachments,
    onToggleForm,
    onTitleChange,
    onContentChange,
    onExpirationDateChange,
    onAttachmentsChange,
    onPost,
    onCancel,
    onDelete,
    onStartEdit,
    onSaveEdit,
    onCancelEdit,
    onEditTitleChange,
    onEditContentChange,
    onEditAttachmentsChange,
    onTogglePin
  } = props;

  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  // Filter announcements based on expanded state
  const displayedAnnouncements = expandedId
    ? announcements.filter(a => a._id === expandedId)
    : announcements;

  return (
    <>
      <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#FF0000]/40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-[#FF0000]" />
            <h3 className="text-3xl font-black text-white">Organization Announcements</h3>
          </div>
          <button
            onClick={onToggleForm}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF0000] to-[#DC143C] hover:from-[#DC143C] hover:to-[#FF0000] rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="h-5 w-5 text-white" />
            <span className="text-white font-bold">New</span>
          </button>
        </div>

        {/* New Announcement Form */}
        {showNewForm && (
          <OrgAnnouncementForm
            newTitle={newTitle}
            setNewTitle={onTitleChange}
            newContent={newContent}
            setNewContent={onContentChange}
            expirationDate={expirationDate}
            setExpirationDate={onExpirationDateChange}
            attachments={newAttachments}
            setAttachments={onAttachmentsChange}
            onCancel={onCancel}
            onPost={onPost}
          />
        )}

        {/* Announcements */}
        {announcements.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-[#87CEEB] text-lg font-semibold">No organization announcements yet</p>
            <p className="text-gray-400 mt-2">Create announcements visible to the entire organization</p>
          </div>
        ) : (
          <div className={`${expandedId ? '' : 'flex gap-4 overflow-x-auto pb-4'} custom-scrollbar`}>
            {displayedAnnouncements
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map((announcement) => {
                const isEditing = editingId === announcement._id;
                const isExpanded = expandedId === announcement._id;
                const contentLength = announcement.content?.length || 0;
                const isLongContent = contentLength > 1;
                const borderColor = announcement.borderColor || '#FF0000';
                
                return (
                  <div
                    key={announcement._id}
                    className={`org-announcement-card relative rounded-xl transition-all duration-300 border-2 overflow-hidden ${
                      isExpanded ? 'w-full' : 'w-[400px] flex-shrink-0'
                    }`}
                    style={{
                      backgroundColor: `${borderColor}33`,
                      borderColor: borderColor,
                      boxShadow: `inset 0 0 20px -3px ${borderColor}`
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
                              onClick={() => onSaveEdit(announcement._id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold transition-all"
                              style={{ 
                                backgroundColor: borderColor,
                                opacity: 0.9 
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
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
                                onClick={() => setExpandedId(isExpanded ? null : announcement._id)}
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

                          {/* Expiration Date Display */}
                          {announcement.expirationDate && (
                            <div 
                              className="mt-3 p-2 rounded-lg border"
                              style={{ 
                                backgroundColor: `${borderColor}20`,
                                borderColor: `${borderColor}60`
                              }}
                            >
                              <p className="text-xs font-semibold" style={{ color: borderColor }}>
                                ⏰ Expires at 5:00 PM on {new Date(announcement.expirationDate).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          )}
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
          @keyframes org-pulse {
            0%, 100% {
              box-shadow: inset 0 0 20px -3px currentColor;
            }
            50% {
              box-shadow: inset 0 0 40px 0px currentColor;
            }
          }

          .custom-scrollbar::-webkit-scrollbar {
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 128, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to right, #FF0000, #DC143C);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to right, #DC143C, #FF0000);
          }
        `}</style>
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