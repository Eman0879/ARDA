// app/components/depthead-project/DeptHeadProjectManagement.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Plus, Filter, Target, FolderKanban, ListChecks } from 'lucide-react';
import CreateModal from './CreateModal';
import EditModal from './EditModal';
import ItemCard from './ItemCard';
import DeptHeadDetailModal from './DeptHeadDetailModal';
import ReviewModal from './ReviewModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Toast from './Toast';
import { TeamMember, Sprint, Project, Task, ActiveTab, Attachment } from './types';

export default function DeptHeadProjectManagement() {
  const { theme, colors, cardCharacters } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>('sprints');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Toast notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  
  // Data states
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // User info
  const [userDepartment, setUserDepartment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  // Form states
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingItem, setEditingItem] = useState<Sprint | Project | Task | null>(null);
  const [detailItem, setDetailItem] = useState<Sprint | Project | Task | null>(null);
  const [reviewItem, setReviewItem] = useState<Sprint | Task | null>(null);
  const [reviewType, setReviewType] = useState<'approve' | 'reject' | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [deleteItemTitle, setDeleteItemTitle] = useState<string>('');

  const displayToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserDepartment(user.department || '');
      setUserName(user.displayName || user.username);
      setUserEmail(user.email || '');
      setUserId(user.username);
    }
  }, []);

  useEffect(() => {
    if (userDepartment) {
      fetchTeamMembers();
      fetchData();
    }
  }, [userDepartment, activeTab, statusFilter]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`/api/team-members?department=${userDepartment}`);
      const data = await res.json();
      if (data.success) {
        const validMembers = data.data.filter(m => 
          m.username && m.displayName && m.email
        );
        setTeamMembers(validMembers);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const endpoint = `/api/${activeTab}?department=${userDepartment}${statusParam}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success) {
        if (activeTab === 'sprints') setSprints(data.data);
        else if (activeTab === 'projects') setProjects(data.data);
        else if (activeTab === 'tasks') setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormData({});
    setSelectedAssignees([]);
    setMentions([]);
    setAttachments([]);
    setShowCreateModal(true);
  };

  const openEditModal = (item: Sprint | Project | Task) => {
    setEditingItem(item);
    setFormData(item);
    setSelectedAssignees(item.assignees.map(a => a.employeeId));
    setMentions(item.mentions || []);
    setAttachments(item.attachments || []);
    setShowEditModal(true);
  };

  const openReviewForApproval = (item: Sprint | Task, approved: boolean) => {
    setReviewItem(item);
    setReviewType(approved ? 'approve' : 'reject');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (approved: boolean, feedback: string) => {
    if (!reviewItem) return;

    try {
      const type = 'projectId' in reviewItem ? 'task' : 'sprint';
      const endpoint = type === 'sprint' ? `/api/sprints/${reviewItem._id}` : `/api/tasks/${reviewItem._id}`;

      const feedbackEntry = {
        author: {
          employeeId: userId,
          name: userName,
          email: userEmail
        },
        content: feedback,
        action: approved ? 'approved' : 'rejected',
        createdAt: new Date().toISOString()
      };

      const body = {
        status: approved ? 'completed' : 'in-progress',
        feedback: [...(reviewItem.feedback || []), feedbackEntry]
      };

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (data.success) {
        displayToast(`Successfully ${approved ? 'approved' : 'rejected'} the item`, 'success');
        fetchData();
      } else {
        displayToast(data.error || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      displayToast('An error occurred while submitting review', 'error');
    }
  };

  const handleCreate = async () => {
    try {
      const titleField = activeTab === 'projects' ? 'name' : 'title';
      if (!formData[titleField]?.trim() || !formData.description?.trim()) {
        displayToast('Please fill in required fields', 'warning');
        return;
      }
      
      if (activeTab === 'tasks' && !formData.projectId) {
        displayToast('Please select a project', 'warning');
        return;
      }
      
      if (activeTab === 'sprints' && !formData.dueDate) {
        displayToast('Please select a due date', 'warning');
        return;
      }
      
      if (selectedAssignees.length === 0 && activeTab !== 'projects') {
        displayToast('Please select at least one assignee', 'warning');
        return;
      }
      
      const selectedMembers = teamMembers.filter(m => 
        selectedAssignees.includes(m.username)
      );
      
      const assigneesArray = selectedMembers.map(m => ({
        employeeId: m.username,
        name: m.displayName,
        email: m.email
      }));

      const body = {
        ...formData,
        department: userDepartment,
        assignees: assigneesArray,
        mentions,
        attachments,
        createdBy: {
          employeeId: userId,
          name: userName,
          email: userEmail
        }
      };

      const endpoint = `/api/${activeTab}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (data.success) {
        setShowCreateModal(false);
        displayToast(`${activeTab.slice(0, -1)} created successfully`, 'success');
        fetchData();
      } else {
        displayToast(data.error || 'Failed to create item', 'error');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      displayToast('An error occurred while creating item', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      const titleField = activeTab === 'projects' ? 'name' : 'title';
      if (!formData[titleField]?.trim() || !formData.description?.trim()) {
        displayToast('Please fill in required fields', 'warning');
        return;
      }

      const selectedMembers = teamMembers.filter(m => 
        selectedAssignees.includes(m.username)
      );
      
      const assigneesArray = selectedMembers.map(m => ({
        employeeId: m.username,
        name: m.displayName,
        email: m.email
      }));

      const body = {
        ...formData,
        assignees: assigneesArray,
        mentions,
        attachments
      };

      const endpoint = `/api/${activeTab}/${editingItem._id}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      
      if (data.success) {
        setShowEditModal(false);
        setEditingItem(null);
        displayToast(`${activeTab.slice(0, -1)} updated successfully`, 'success');
        fetchData();
      } else {
        displayToast(data.error || 'Failed to update item', 'error');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      displayToast('An error occurred while updating item', 'error');
    }
  };

  const openDeleteModal = (item: Sprint | Project | Task) => {
    const title = 'title' in item ? item.title : 'name' in item ? item.name : '';
    setDeleteItemId(item._id);
    setDeleteItemTitle(title);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteItemId) return;

    try {
      const res = await fetch(`/api/${activeTab}/${deleteItemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        displayToast(`${activeTab.slice(0, -1)} deleted successfully`, 'success');
        fetchData();
      } else {
        displayToast(data.error || 'Failed to delete', 'error');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      displayToast('An error occurred while deleting item', 'error');
    }
  };

  const currentData = activeTab === 'sprints' ? sprints : activeTab === 'projects' ? projects : tasks;

  return (
    <div className={`min-h-screen p-6 bg-gradient-to-br ${colors.background} relative`}>
      {/* Paper Texture Background */}
      <div className={`fixed inset-0 ${colors.paperTexture} opacity-[0.02] pointer-events-none`}></div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold ${colors.textPrimary}`}>
            Project Management
          </h1>
          <button
            onClick={openCreateModal}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all overflow-hidden ${colors.buttonPrimary} ${colors.buttonPrimaryText} ${colors.shadowCard} hover:${colors.shadowHover}`}
          >
            {/* Paper Texture Layer */}
            <div className={`absolute inset-0 opacity-[0.02] ${colors.paperTexture}`}></div>
            
            {/* Internal Glow Layer */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ boxShadow: `inset 0 0 20px var(--glow-primary)` }}>
            </div>
            
            <Plus className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-all duration-300" />
            <span className="relative z-10">Create New</span>
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-6 border-b ${colors.border}`}>
          {[
            { key: 'sprints', label: 'Daily Sprints', icon: Target },
            { key: 'projects', label: 'Projects', icon: FolderKanban },
            { key: 'tasks', label: 'Tasks', icon: ListChecks }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as ActiveTab)}
              className={`group relative flex items-center gap-2 px-6 py-3 transition-all ${
                activeTab === key
                  ? `border-b-2 ${colors.borderStrong} ${colors.textAccent}`
                  : `${colors.textSecondary} hover:${colors.textPrimary}`
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === key ? 'group-hover:rotate-12' : ''} transition-all duration-300`} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-3">
          <Filter className={`w-5 h-5 ${colors.textMuted}`} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border transition-all ${colors.inputBg} ${colors.inputBorder} ${colors.inputText} ${colors.inputFocusBg} focus:outline-none focus:ring-2 focus:ring-opacity-50`}
          >
            <option value="all">All Status</option>
            {activeTab === 'sprints' && (
              <>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </>
            )}
            {activeTab === 'projects' && (
              <>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </>
            )}
            {activeTab === 'tasks' && (
              <>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </>
            )}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto ${colors.borderStrong} border-t-transparent`}
                 style={{ borderColor: `${colors.glowPrimary} transparent transparent transparent` }} />
          </div>
        ) : (
          <div className="grid gap-4">
            {currentData.map(item => (
              <ItemCard
                key={item._id}
                item={item}
                type={activeTab}
                onDelete={() => openDeleteModal(item)}
                onEdit={openEditModal}
                onApprove={activeTab !== 'projects' ? (item) => openReviewForApproval(item as Sprint | Task, true) : undefined}
                onReject={activeTab !== 'projects' ? (item) => openReviewForApproval(item as Sprint | Task, false) : undefined}
                onViewDetails={(item) => {
                  setDetailItem(item);
                  setShowDetailModal(true);
                }}
              />
            ))}
            {currentData.length === 0 && (
              <div className={`text-center py-12 ${colors.textMuted}`}>
                No {activeTab} found. Click "Create New" to get started.
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <CreateModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          activeTab={activeTab}
          formData={formData}
          setFormData={setFormData}
          selectedAssignees={selectedAssignees}
          setSelectedAssignees={setSelectedAssignees}
          mentions={mentions}
          setMentions={setMentions}
          teamMembers={teamMembers}
          projects={projects}
          theme={theme}
          attachments={attachments}
          setAttachments={setAttachments}
          userId={userId}
          userName={userName}
        />

        <EditModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingItem(null);
          }}
          onUpdate={handleUpdate}
          activeTab={activeTab}
          formData={formData}
          setFormData={setFormData}
          selectedAssignees={selectedAssignees}
          setSelectedAssignees={setSelectedAssignees}
          mentions={mentions}
          setMentions={setMentions}
          teamMembers={teamMembers}
          projects={projects}
          theme={theme}
          attachments={attachments}
          setAttachments={setAttachments}
          userId={userId}
          userName={userName}
        />

        <DeptHeadDetailModal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setDetailItem(null);
          }}
          item={detailItem}
          theme={theme}
          onEdit={(item) => {
            setShowDetailModal(false);
            openEditModal(item);
          }}
          onReview={undefined}
        />

        <ReviewModal
          show={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setReviewItem(null);
            setReviewType(null);
          }}
          item={reviewItem}
          reviewType={reviewType}
          theme={theme}
          onSubmit={handleReviewSubmit}
        />

        <DeleteConfirmModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteItemId(null);
            setDeleteItemTitle('');
          }}
          onConfirm={handleDelete}
          itemTitle={deleteItemTitle}
          itemType={activeTab.slice(0, -1)}
          theme={theme}
        />

        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          theme={theme}
        />
      </div>
    </div>
  );
}