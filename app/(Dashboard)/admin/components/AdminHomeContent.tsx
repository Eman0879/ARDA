// app/(Dashboard)/admin/components/HomeContent/AdminHomeContent.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Globe, Users as UsersIcon, UserCheck } from 'lucide-react';
import OrgAnnouncementsSection from './HomeContent/OrgAnnouncementsSection';
import AnnouncementsBoard from './HomeContent/AnnouncementBoard';
import Styles from './HomeContent/Styles';
import { Announcement, OrgAnnouncement, Attachment, Comment } from './HomeContent/types';

interface Stats {
  totalUsers: number;
  totalDepartments: number;
  pendingApprovals: number;
}

interface AdminHomeContentProps {
  onNavigate?: (section: string, filter?: string) => void;
}

export default function AdminHomeContent({ onNavigate }: AdminHomeContentProps) {
  // Org Announcements State
  const [orgAnnouncements, setOrgAnnouncements] = useState<OrgAnnouncement[]>([]);
  const [showNewOrgAnnouncement, setShowNewOrgAnnouncement] = useState(false);
  const [newOrgTitle, setNewOrgTitle] = useState('');
  const [newOrgContent, setNewOrgContent] = useState('');
  const [orgExpirationDate, setOrgExpirationDate] = useState('');
  const [newOrgAttachments, setNewOrgAttachments] = useState<Attachment[]>([]);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editOrgTitle, setEditOrgTitle] = useState('');
  const [editOrgContent, setEditOrgContent] = useState('');
  const [editOrgAttachments, setEditOrgAttachments] = useState<Attachment[]>([]);

  // Department Announcements State
  const [deptAnnouncements, setDeptAnnouncements] = useState<Announcement[]>([]);
  const [showNewDeptAnnouncement, setShowNewDeptAnnouncement] = useState(false);
  const [newDeptTitle, setNewDeptTitle] = useState('');
  const [newDeptContent, setNewDeptContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0000FF');
  const [deptExpirationDate, setDeptExpirationDate] = useState('');
  const [newDeptAttachments, setNewDeptAttachments] = useState<Attachment[]>([]);
  const [expandedAnnouncement, setExpandedAnnouncement] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editDeptTitle, setEditDeptTitle] = useState('');
  const [editDeptContent, setEditDeptContent] = useState('');
  const [editDeptAttachments, setEditDeptAttachments] = useState<Attachment[]>([]);

  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalDepartments: 0, pendingApprovals: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([
      fetchOrgAnnouncements(),
      fetchDeptAnnouncements(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchOrgAnnouncements = async () => {
    try {
      const response = await fetch('/api/org-announcements');
      if (response.ok) {
        const data = await response.json();
        setOrgAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching org announcements:', error);
    }
  };

  const fetchDeptAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements?department=Admin');
      if (response.ok) {
        const data = await response.json();
        setDeptAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching dept announcements:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Org Announcements Handlers
  const createOrgAnnouncement = async () => {
    if (!newOrgTitle.trim() || !newOrgContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const response = await fetch('/api/org-announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newOrgTitle,
          content: newOrgContent,
          author: user?.displayName || user?.username || 'Admin',
          expirationDate: orgExpirationDate || undefined,
          attachments: newOrgAttachments
        })
      });

      if (response.ok) {
        setNewOrgTitle('');
        setNewOrgContent('');
        setOrgExpirationDate('');
        setNewOrgAttachments([]);
        setShowNewOrgAnnouncement(false);
        fetchOrgAnnouncements();
      }
    } catch (error) {
      console.error('Error creating org announcement:', error);
      alert('Failed to create announcement');
    }
  };

  const updateOrgAnnouncement = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/org-announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        fetchOrgAnnouncements();
      }
    } catch (error) {
      console.error('Error updating org announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const deleteOrgAnnouncement = async (id: string) => {
    try {
      const response = await fetch(`/api/org-announcements?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchOrgAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting org announcement:', error);
    }
  };

  // Department Announcements Handlers
  const createDeptAnnouncement = async () => {
    if (!newDeptTitle.trim() || !newDeptContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDeptTitle,
          content: newDeptContent,
          color: selectedColor,
          department: 'Admin',
          expirationDate: deptExpirationDate || undefined,
          attachments: newDeptAttachments
        })
      });

      if (response.ok) {
        setNewDeptTitle('');
        setNewDeptContent('');
        setSelectedColor('#0000FF');
        setDeptExpirationDate('');
        setNewDeptAttachments([]);
        setShowNewDeptAnnouncement(false);
        fetchDeptAnnouncements();
      }
    } catch (error) {
      console.error('Error creating dept announcement:', error);
      alert('Failed to create announcement');
    }
  };

  const updateDeptAnnouncement = async (id: string, updates: any) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });

      if (response.ok) {
        fetchDeptAnnouncements();
      }
    } catch (error) {
      console.error('Error updating dept announcement:', error);
      alert('Failed to update announcement');
    }
  };

  const deleteDeptAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const response = await fetch(`/api/announcements?id=${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchDeptAnnouncements();
      }
    } catch (error) {
      console.error('Error deleting dept announcement:', error);
    }
  };

  const addComment = async (announcementId: string) => {
    const commentText = newComment[announcementId]?.trim();
    if (!commentText) return;

    try {
      const response = await fetch('/api/announcements/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          author: user?.displayName || user?.username || 'Admin',
          text: commentText
        })
      });

      if (response.ok) {
        setNewComment({ ...newComment, [announcementId]: '' });
        fetchDeptAnnouncements();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleCommentPin = async (announcementId: string, commentId: string, currentPinned: boolean) => {
    try {
      const response = await fetch('/api/announcements/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId,
          commentId,
          pinned: !currentPinned
        })
      });

      if (response.ok) {
        fetchDeptAnnouncements();
      }
    } catch (error) {
      console.error('Error toggling comment pin:', error);
    }
  };

  const handleNavigateToUsers = (filter?: string) => {
    if (onNavigate) {
      onNavigate('manage-users', filter);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 border-4 border-[#0000FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white text-xl font-bold mt-6">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <>
      <Styles />
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-8 border-2 border-[#0000FF]/40">
          <div className="flex items-center gap-4 mb-2">
            <Shield className="h-10 w-10 text-[#FFD700]" />
            <h2 className="text-4xl font-black text-white">Admin Control Center</h2>
          </div>
          <p className="text-[#87CEEB] text-lg font-semibold">
            Manage users, announcements, and system-wide settings
          </p>
        </div>

        {/* Stats Cards - Clickable */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => handleNavigateToUsers()}
            className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#0000FF]/40 hover:border-[#0000FF]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#0000FF]/20 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#0000FF]/20 rounded-xl group-hover:bg-[#0000FF]/30 transition-all">
                <UsersIcon className="h-8 w-8 text-[#87CEEB]" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-semibold">Total Users</p>
                <p className="text-white text-3xl font-black">{stats.totalUsers}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleNavigateToUsers()}
            className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#6495ED]/40 hover:border-[#6495ED]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#6495ED]/20 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#6495ED]/20 rounded-xl group-hover:bg-[#6495ED]/30 transition-all">
                <Globe className="h-8 w-8 text-[#87CEEB]" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-semibold">Departments</p>
                <p className="text-white text-3xl font-black">{stats.totalDepartments}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleNavigateToUsers('unapproved')}
            className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-[#FFD700]/40 hover:border-[#FFD700]/80 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FFD700]/20 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#FFD700]/20 rounded-xl group-hover:bg-[#FFD700]/30 transition-all">
                <UserCheck className="h-8 w-8 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-gray-400 text-sm font-semibold">Pending Approvals</p>
                <p className="text-white text-3xl font-black">{stats.pendingApprovals}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Organization Announcements */}
        <OrgAnnouncementsSection
          announcements={orgAnnouncements}
          showNewForm={showNewOrgAnnouncement}
          newTitle={newOrgTitle}
          newContent={newOrgContent}
          expirationDate={orgExpirationDate}
          newAttachments={newOrgAttachments}
          editingId={editingOrgId}
          editTitle={editOrgTitle}
          editContent={editOrgContent}
          editAttachments={editOrgAttachments}
          onToggleForm={() => setShowNewOrgAnnouncement(!showNewOrgAnnouncement)}
          onTitleChange={setNewOrgTitle}
          onContentChange={setNewOrgContent}
          onExpirationDateChange={setOrgExpirationDate}
          onAttachmentsChange={setNewOrgAttachments}
          onPost={createOrgAnnouncement}
          onCancel={() => {
            setShowNewOrgAnnouncement(false);
            setNewOrgTitle('');
            setNewOrgContent('');
            setOrgExpirationDate('');
            setNewOrgAttachments([]);
          }}
          onDelete={deleteOrgAnnouncement}
          onStartEdit={(announcement) => {
            setEditingOrgId(announcement._id);
            setEditOrgTitle(announcement.title);
            setEditOrgContent(announcement.content);
            setEditOrgAttachments(announcement.attachments || []);
          }}
          onSaveEdit={(id) => {
            updateOrgAnnouncement(id, { 
              title: editOrgTitle, 
              content: editOrgContent,
              attachments: editOrgAttachments 
            });
            setEditingOrgId(null);
            setEditOrgTitle('');
            setEditOrgContent('');
            setEditOrgAttachments([]);
          }}
          onCancelEdit={() => {
            setEditingOrgId(null);
            setEditOrgTitle('');
            setEditOrgContent('');
            setEditOrgAttachments([]);
          }}
          onEditTitleChange={setEditOrgTitle}
          onEditContentChange={setEditOrgContent}
          onEditAttachmentsChange={setEditOrgAttachments}
          onTogglePin={(id, currentPinned) => updateOrgAnnouncement(id, { pinned: !currentPinned })}
        />

        {/* Admin Department Announcements */}
        <AnnouncementsBoard
          announcements={deptAnnouncements}
          showNewAnnouncement={showNewDeptAnnouncement}
          newTitle={newDeptTitle}
          newContent={newDeptContent}
          selectedColor={selectedColor}
          expirationDate={deptExpirationDate}
          newAttachments={newDeptAttachments}
          expandedAnnouncement={expandedAnnouncement}
          newComment={newComment}
          editingAnnouncement={editingDeptId}
          editTitle={editDeptTitle}
          editContent={editDeptContent}
          editAttachments={editDeptAttachments}
          onToggleNewAnnouncement={() => setShowNewDeptAnnouncement(!showNewDeptAnnouncement)}
          onTitleChange={setNewDeptTitle}
          onContentChange={setNewDeptContent}
          onColorChange={setSelectedColor}
          onExpirationDateChange={setDeptExpirationDate}
          onAttachmentsChange={setNewDeptAttachments}
          onCancelNew={() => {
            setShowNewDeptAnnouncement(false);
            setNewDeptTitle('');
            setNewDeptContent('');
            setSelectedColor('#0000FF');
            setDeptExpirationDate('');
            setNewDeptAttachments([]);
          }}
          onPostNew={createDeptAnnouncement}
          onToggleExpand={(id) => setExpandedAnnouncement(expandedAnnouncement === id ? null : id)}
          onTogglePin={(id, currentPinned) => updateDeptAnnouncement(id, { pinned: !currentPinned })}
          onToggleUrgent={(id, currentUrgent) => updateDeptAnnouncement(id, { urgent: !currentUrgent })}
          onDelete={deleteDeptAnnouncement}
          onStartEdit={(announcement) => {
            setEditingDeptId(announcement._id);
            setEditDeptTitle(announcement.title);
            setEditDeptContent(announcement.content);
            setEditDeptAttachments(announcement.attachments || []);
          }}
          onCancelEdit={() => {
            setEditingDeptId(null);
            setEditDeptTitle('');
            setEditDeptContent('');
            setEditDeptAttachments([]);
          }}
          onSaveEdit={(id) => {
            updateDeptAnnouncement(id, { 
              title: editDeptTitle, 
              content: editDeptContent,
              attachments: editDeptAttachments 
            });
            setEditingDeptId(null);
            setEditDeptTitle('');
            setEditDeptContent('');
            setEditDeptAttachments([]);
          }}
          onEditTitleChange={setEditDeptTitle}
          onEditContentChange={setEditDeptContent}
          onEditAttachmentsChange={setEditDeptAttachments}
          onCommentChange={(announcementId, comment) => 
            setNewComment({ ...newComment, [announcementId]: comment })
          }
          onAddComment={addComment}
          onToggleCommentPin={toggleCommentPin}
        />
      </div>
    </>
  );
}