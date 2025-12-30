// app/components/DeptHeadAnnouncements/AnnouncementsPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Search, Filter, SortAsc, SortDesc, ArrowLeft, Plus, Pin as PinIcon } from 'lucide-react';
import { Announcement, Attachment } from './types';
import AnnouncementCard from './AnnouncementCard';
import NewAnnouncementForm from './NewAnnouncementForm';

interface AnnouncementsPageProps {
  department: string;
  userDisplayName: string;
  isDeptHead?: boolean;
  onBack?: () => void;
}

export default function AnnouncementsPage({ department, userDisplayName, isDeptHead = false, onBack }: AnnouncementsPageProps) {
  const { colors, showToast, cardCharacters } = useTheme();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'pinned' | 'urgent'>('all');
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#2196F3');
  const [expirationDate, setExpirationDate] = useState('');
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editAttachments, setEditAttachments] = useState<Attachment[]>([]);
  
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  // Informative character for the page
  const charColors = cardCharacters.informative;

  useEffect(() => {
    fetchAnnouncements();
  }, [department]);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`/api/announcements?department=${encodeURIComponent(department)}`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast('Failed to fetch announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department,
          title: newTitle,
          content: newContent,
          color: selectedColor,
          expirationDate: expirationDate || null,
          attachments: newAttachments
        })
      });

      if (response.ok) {
        setNewTitle('');
        setNewContent('');
        setSelectedColor('#2196F3');
        setExpirationDate('');
        setNewAttachments([]);
        setShowNewAnnouncement(false);
        fetchAnnouncements();
        showToast('Announcement created successfully', 'success');
      } else {
        showToast('Failed to create announcement', 'error');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
      showToast('Error creating announcement', 'error');
    }
  };

  const updateAnnouncement = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        fetchAnnouncements();
        showToast('Announcement updated successfully', 'success');
      } else {
        showToast('Failed to update announcement', 'error');
      }
    } catch (error) {
      console.error('Error updating announcement:', error);
      showToast('Error updating announcement', 'error');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (expandedAnnouncement === id) {
          setExpandedAnnouncement(null);
        }
        fetchAnnouncements();
        showToast('Announcement deleted', 'success');
      } else {
        showToast('Failed to delete announcement', 'error');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showToast('Error deleting announcement', 'error');
    }
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;

    await updateAnnouncement(id, {
      title: editTitle,
      content: editContent,
      attachments: editAttachments
    });

    setEditingAnnouncement(null);
    setEditTitle('');
    setEditContent('');
    setEditAttachments([]);
  };

  const startEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement._id);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setEditAttachments(announcement.attachments || []);
  };

  const cancelEdit = () => {
    setEditingAnnouncement(null);
    setEditTitle('');
    setEditContent('');
    setEditAttachments([]);
  };

  const addComment = async (announcementId: string) => {
    const commentText = newComment[announcementId]?.trim();
    if (!commentText) return;

    try {
      const response = await fetch('/api/announcements/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          author: userDisplayName,
          text: commentText
        })
      });

      if (response.ok) {
        setNewComment({ ...newComment, [announcementId]: '' });
        fetchAnnouncements();
        showToast('Comment added', 'success');
      } else {
        showToast('Failed to add comment', 'error');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      showToast('Error adding comment', 'error');
    }
  };

  const toggleCommentPin = async (announcementId: string, commentId: string, currentPinned: boolean) => {
    try {
      const response = await fetch('/api/announcements/comment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          commentId,
          pinned: !currentPinned
        })
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling comment pin:', error);
      showToast('Failed to update comment', 'error');
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const filteredAndSortedAnnouncements = announcements
    .filter(announcement => {
      const matchesSearch = 
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'pinned' && announcement.pinned) ||
        (filterBy === 'urgent' && announcement.urgent);
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
    });

  return (
    <div className="space-y-5">
      {/* Header Section */}
      <div className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${colors.cardBg} rounded-xl p-5 border-2 ${charColors.border} ${colors.shadowCard}`}>
        {/* Paper Texture */}
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
              >
                {/* Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                
                {/* Internal Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                ></div>
                
                <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 icon-rotate ${charColors.iconColor}`} />
              </button>
              <div>
                <h1 className={`text-2xl font-black ${colors.textPrimary}`}>
                  All Announcements
                </h1>
                <p className={`text-sm ${colors.textMuted} font-semibold`}>
                  {filteredAndSortedAnnouncements.length} of {announcements.length} announcements
                </p>
              </div>
            </div>
            
            {/* Only show New Announcement button if user is dept head */}
            {isDeptHead && (
              <button
                onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}
                className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
              >
                {/* Paper Texture */}
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                
                {/* Internal Glow */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                ></div>
                
                <Plus className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:rotate-90 icon-rotate ${charColors.iconColor}`} />
                <span className={`text-sm font-bold relative z-10 ${charColors.accent}`}>New Announcement</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[250px] relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${colors.textMuted}`} />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${colors.inputBg} ${colors.inputText} backdrop-blur-sm border-2 ${colors.inputBorder} ${colors.inputFocusBg} rounded-lg text-sm ${colors.inputPlaceholder} font-semibold transition-all`}
              />
            </div>

            <div className="relative">
              <Filter className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${colors.textMuted} pointer-events-none`} />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className={`pl-10 pr-8 py-2 ${colors.dropdownBg} ${colors.dropdownText} backdrop-blur-sm border-2 ${colors.dropdownBorder} rounded-lg text-sm font-semibold appearance-none cursor-pointer transition-all`}
              >
                <option value="all">All Announcements</option>
                <option value="pinned">Pinned Only</option>
                <option value="urgent">Urgent Only</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className={`pl-4 pr-8 py-2 ${colors.dropdownBg} ${colors.dropdownText} backdrop-blur-sm border-2 ${colors.dropdownBorder} rounded-lg text-sm font-semibold appearance-none cursor-pointer transition-all`}
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`group relative px-3 py-2 ${colors.inputBg} backdrop-blur-sm border-2 ${colors.inputBorder} ${colors.borderHover} rounded-lg transition-all duration-300 overflow-hidden`}
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {/* Internal Glow */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              
              {sortOrder === 'asc' ? (
                <SortAsc className={`h-5 w-5 relative z-10 ${colors.textPrimary} transition-transform duration-300 group-hover:scale-110`} />
              ) : (
                <SortDesc className={`h-5 w-5 relative z-10 ${colors.textPrimary} transition-transform duration-300 group-hover:scale-110`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* New Announcement Form - Only visible for dept heads */}
      {isDeptHead && showNewAnnouncement && (
        <div className={`relative overflow-hidden backdrop-blur-xl bg-gradient-to-br ${colors.cardBg} rounded-xl border-2 ${charColors.border} ${colors.shadowCard}`}>
          {/* Paper Texture */}
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          
          <div className="relative z-10">
            <NewAnnouncementForm
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newContent={newContent}
              setNewContent={setNewContent}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              expirationDate={expirationDate}
              setExpirationDate={setExpirationDate}
              attachments={newAttachments}
              setAttachments={setNewAttachments}
              onCancel={() => {
                setShowNewAnnouncement(false);
                setNewTitle('');
                setNewContent('');
                setSelectedColor('#2196F3');
                setExpirationDate('');
                setNewAttachments([]);
              }}
              onPost={createAnnouncement}
            />
          </div>
        </div>
      )}

      {/* Announcements Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className={`w-12 h-12 border-2 ${colors.textAccent} border-t-transparent rounded-full animate-spin mx-auto mb-3`}></div>
          <p className={`${colors.textPrimary} font-semibold`}>Loading announcements...</p>
        </div>
      ) : filteredAndSortedAnnouncements.length === 0 ? (
        <div className={`relative overflow-hidden text-center py-12 backdrop-blur-xl bg-gradient-to-br ${colors.cardBg} rounded-xl border-2 ${colors.border} ${colors.shadowCard}`}>
          {/* Paper Texture */}
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          
          <div className="relative z-10">
            <PinIcon className={`h-12 w-12 ${colors.textMuted} mx-auto mb-3`} />
            <p className={`${colors.textAccent} text-base font-semibold`}>
              {searchQuery || filterBy !== 'all' ? 'No matching announcements found' : 'No announcements yet'}
            </p>
            <p className={`${colors.textMuted} text-sm mt-1.5`}>
              {searchQuery || filterBy !== 'all' ? 'Try adjusting your search or filters' : isDeptHead ? 'Create your first announcement to get started' : 'Check back later for updates'}
            </p>
          </div>
        </div>
      ) : (
        <div className={`${expandedAnnouncement ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
          {filteredAndSortedAnnouncements.map((announcement) => {
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
                  onToggleExpand={() => setExpandedAnnouncement(isExpanded ? null : announcement._id)}
                  onTogglePin={isDeptHead ? () => updateAnnouncement(announcement._id, { pinned: !announcement.pinned }) : undefined}
                  onToggleUrgent={isDeptHead ? () => updateAnnouncement(announcement._id, { urgent: !announcement.urgent }) : undefined}
                  onDelete={isDeptHead ? () => deleteAnnouncement(announcement._id) : undefined}
                  onStartEdit={isDeptHead ? () => startEdit(announcement) : undefined}
                  onCancelEdit={cancelEdit}
                  onSaveEdit={() => saveEdit(announcement._id)}
                  onEditTitleChange={setEditTitle}
                  onEditContentChange={setEditContent}
                  onEditAttachmentsChange={setEditAttachments}
                  onCommentChange={(comment) => setNewComment({ ...newComment, [announcement._id]: comment })}
                  onAddComment={() => addComment(announcement._id)}
                  onToggleCommentPin={isDeptHead ? (commentId, currentPinned) => 
                    toggleCommentPin(announcement._id, commentId, currentPinned) : undefined
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