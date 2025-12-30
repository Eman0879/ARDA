// app/components/employee-project/EmployeeProjectView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import { Target, ListChecks } from 'lucide-react';
import EmployeeItemCard from './EmployeeItemCard';
import DetailModal from './DetailModal';
import SubmitModal from './SubmitModal';
import BlockerModal from './BlockerModal';
import { TeamMember, Sprint, Task } from '../depthead-project/types';

export default function EmployeeProjectView() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'sprints' | 'tasks'>('sprints');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  const [userDepartment, setUserDepartment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');

  const [selectedItem, setSelectedItem] = useState<Sprint | Task | null>(null);
  const [submitItem, setSubmitItem] = useState<Sprint | Task | null>(null);
  const [blockerItem, setBlockerItem] = useState<Sprint | Task | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentMentions, setCommentMentions] = useState<string[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showBlockerModal, setShowBlockerModal] = useState(false);

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
    if (userDepartment && userId) {
      fetchTeamMembers();
      fetchData();
    }
  }, [userDepartment, userId, activeTab, statusFilter]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`/api/team-members?department=${userDepartment}`);
      const data = await res.json();
      if (data.success) {
        setTeamMembers(data.data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const endpoint = `/api/${activeTab}?department=${userDepartment}&employeeId=${userId}${statusParam}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success) {
        if (activeTab === 'sprints') setSprints(data.data);
        else setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string, type: 'sprint' | 'task') => {
    try {
      const endpoint = type === 'sprint' ? `/api/sprints/${id}` : `/api/tasks/${id}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
        if (selectedItem && selectedItem._id === id) {
          setSelectedItem(data.data);
        }
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred');
    }
  };

  const handleSubmitForReview = async (message: string) => {
    if (!submitItem) return;

    try {
      const type = 'projectId' in submitItem ? 'task' : 'sprint';
      const endpoint = type === 'sprint' ? `/api/sprints/${submitItem._id}` : `/api/tasks/${submitItem._id}`;

      const feedbackEntry = {
        author: {
          employeeId: userId,
          name: userName,
          email: userEmail
        },
        content: message,
        action: 'submitted',
        createdAt: new Date().toISOString()
      };

      const body = {
        status: 'review',
        feedback: [...(submitItem.feedback || []), feedbackEntry]
      };

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.success) {
        setShowSubmitModal(false);
        setSubmitItem(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to submit');
      }
    } catch (error) {
      console.error('Error submitting:', error);
      alert('An error occurred');
    }
  };

  const handleReportBlocker = async (reason: string) => {
    if (!blockerItem) return;

    try {
      const type = 'projectId' in blockerItem ? 'task' : 'sprint';
      const endpoint = type === 'sprint' ? `/api/sprints/${blockerItem._id}` : `/api/tasks/${blockerItem._id}`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'blocked',
          blockerReason: reason
        })
      });

      const data = await res.json();
      if (data.success) {
        setShowBlockerModal(false);
        setBlockerItem(null);
        fetchData();
        if (showDetailModal && selectedItem?._id === blockerItem._id) {
          setSelectedItem(data.data);
        }
      } else {
        alert(data.error || 'Failed to report blocker');
      }
    } catch (error) {
      console.error('Error reporting blocker:', error);
      alert('An error occurred');
    }
  };

  const addComment = async () => {
    if (!selectedItem || !('projectId' in selectedItem) || !commentText.trim()) return;

    try {
      const newComment = {
        author: {
          employeeId: userId,
          name: userName,
          email: userEmail
        },
        content: commentText,
        createdAt: new Date().toISOString()
      };

      const updatedComments = [...(selectedItem.comments || []), newComment];

      const res = await fetch(`/api/tasks/${selectedItem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          comments: updatedComments,
          mentions: commentMentions 
        })
      });

      const data = await res.json();
      if (data.success) {
        setCommentText('');
        setCommentMentions([]);
        fetchData();
        setSelectedItem(data.data);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const currentData = activeTab === 'sprints' ? sprints : tasks;

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className={`text-3xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#0000FF]'}`}>
          My Assignments
        </h1>

        <div className={`flex gap-2 mb-6 border-b ${theme === 'dark' ? 'border-[#000080]' : 'border-gray-300'}`}>
          {[
            { key: 'sprints', label: 'My Sprints', icon: Target },
            { key: 'tasks', label: 'My Tasks', icon: ListChecks }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-6 py-3 transition-all ${
                activeTab === key
                  ? theme === 'dark'
                    ? 'border-b-2 border-[#0000FF] text-[#87CEEB]'
                    : 'border-b-2 border-[#0000FF] text-[#0000FF]'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              theme === 'dark'
                ? 'bg-black/60 border-[#000080] text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
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

        {loading ? (
          <div className="text-center py-12">
            <div className={`w-12 h-12 border-4 rounded-full animate-spin mx-auto ${
              theme === 'dark'
                ? 'border-[#0000FF] border-t-transparent'
                : 'border-[#0000FF] border-t-transparent'
            }`} />
          </div>
        ) : (
          <div className="grid gap-4">
            {currentData.map(item => (
              <EmployeeItemCard
                key={item._id}
                item={item}
                type={activeTab === 'sprints' ? 'sprint' : 'task'}
                theme={theme}
                onViewDetails={(item) => {
                  setSelectedItem(item);
                  setShowDetailModal(true);
                }}
                onStart={(id) => updateStatus(id, 'in-progress', activeTab === 'sprints' ? 'sprint' : 'task')}
                onSubmit={(item) => {
                  setSubmitItem(item);
                  setShowSubmitModal(true);
                }}
                onBlock={(item) => {
                  setBlockerItem(item);
                  setShowBlockerModal(true);
                }}
              />
            ))}
            {currentData.length === 0 && (
              <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                No {activeTab} assigned to you.
              </div>
            )}
          </div>
        )}

        <DetailModal
          show={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          theme={theme}
          teamMembers={teamMembers}
          commentText={commentText}
          setCommentText={setCommentText}
          commentMentions={commentMentions}
          setCommentMentions={setCommentMentions}
          onAddComment={addComment}
        />

        <SubmitModal
          show={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSubmitItem(null);
          }}
          item={submitItem}
          onSubmit={handleSubmitForReview}
          theme={theme}
        />

        <BlockerModal
          show={showBlockerModal}
          onClose={() => {
            setShowBlockerModal(false);
            setBlockerItem(null);
          }}
          item={blockerItem}
          onReportBlocker={handleReportBlocker}
          theme={theme}
        />
      </div>
    </div>
  );
}