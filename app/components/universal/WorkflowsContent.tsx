// ============================================
// UPDATED: app/components/universal/WorkflowsContent.tsx
// Added error handling for deletion with active tickets
// Updated with consistent loading screen
// ============================================

'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import FunctionalityCard from './WorkflowComponents/FunctionalityCard';
import WorkflowModal from './WorkflowComponents/WorkflowModal';
import DeleteConfirmModal from './WorkflowComponents/DeleteConfirmModal';
import { Functionality, Employee } from './WorkflowComponents/types';

export default function WorkflowsContent() {
  const { colors } = useTheme();
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFunctionality, setEditingFunctionality] = useState<Functionality | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{message: string, count: number} | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const department = user.department;

      const [funcRes, empRes] = await Promise.all([
        fetch(`/api/functionalities?department=${department}`),
        fetch(`/api/dept-employees?department=${department}`)
      ]);

      if (funcRes.ok) {
        const funcData = await funcRes.json();
        setFunctionalities(funcData.functionalities || []);
      }

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFunctionality(null);
    setShowModal(true);
  };

  const handleEdit = (func: Functionality) => {
    setEditingFunctionality(func);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/functionalities/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok) {
        setFunctionalities(prev => prev.filter(f => f._id !== id));
        setDeleteConfirm(null);
        setDeleteError(null);
      } else {
        // Handle deletion error (active tickets exist)
        setDeleteError({
          message: data.message || data.error,
          count: data.activeTicketCount || 0
        });
      }
    } catch (error) {
      console.error('Error deleting functionality:', error);
      setDeleteError({
        message: 'An unexpected error occurred while deleting the functionality',
        count: 0
      });
    }
  };

  const handleSave = async (functionality: Omit<Functionality, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const method = editingFunctionality ? 'PUT' : 'POST';
      const url = editingFunctionality 
        ? `/api/functionalities/${editingFunctionality._id}`
        : '/api/functionalities';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...functionality, department: user.department }),
      });

      if (res.ok) {
        const data = await res.json();
        
        // Show update message if tickets were reset
        if (method === 'PUT' && data.ticketsReset > 0) {
          setUpdateMessage(
            `Functionality updated successfully. ${data.ticketsReset} active ticket(s) have been reset to the start of the new workflow.`
          );
          setTimeout(() => setUpdateMessage(null), 5000);
        }
        
        await loadData();
        setShowModal(false);
        setEditingFunctionality(null);
      }
    } catch (error) {
      console.error('Error saving functionality:', error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${colors.background} p-8`}>
        <div className="mb-8">
          <h1 className={`text-4xl font-black ${colors.textPrimary} mb-2`}>
            Workflow Management
          </h1>
          <p className={colors.textSecondary}>
            Loading functionalities and workflows...
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className={`w-14 h-14 ${colors.textAccent} animate-spin mx-auto`} />
            <p className={`${colors.textPrimary} text-base font-bold`}>
              Loading workflows...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${colors.background} p-8`}>
      <div className="mb-8">
        <h1 className={`text-4xl font-black ${colors.textPrimary} mb-2`}>
          Workflow Management
        </h1>
        <p className={colors.textSecondary}>
          Create and manage ticketing functionalities with visual workflows
        </p>
      </div>

      {/* Update Message */}
      {updateMessage && (
        <div className={`mb-6 p-4 rounded-lg border-2 ${colors.border} bg-gradient-to-r from-green-500/20 to-emerald-500/20`}>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className={`${colors.textPrimary} text-sm`}>{updateMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <button
          onClick={handleCreate}
          className={`relative group bg-gradient-to-br ${colors.cardBg} backdrop-blur-xl border-2 ${colors.border} rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${colors.cardBgHover} ${colors.borderHover} hover:shadow-2xl`}
          style={{ boxShadow: `0 0 30px ${colors.brandBlue}20` }}
        >
          <div className="flex flex-col items-center justify-center space-y-4 h-full min-h-[280px]">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, ${colors.brandBlue}20, ${colors.brandLightBlue}20)`,
                boxShadow: `0 0 30px ${colors.brandBlue}40`,
              }}
            >
              <Plus className="w-10 h-10" style={{ color: colors.brandSkyBlue }} />
            </div>
            <div>
              <h3 className={`text-xl font-black ${colors.textPrimary} text-center`}>
                Create New Functionality
              </h3>
              <p className={`${colors.textSecondary} text-sm text-center mt-2`}>
                Build a custom workflow
              </p>
            </div>
          </div>
        </button>

        {functionalities.map((func) => (
          <FunctionalityCard
            key={func._id}
            functionality={func}
            colors={colors}
            onEdit={handleEdit}
            onDelete={() => setDeleteConfirm(func._id)}
          />
        ))}
      </div>

      {showModal && (
        <WorkflowModal
          functionality={editingFunctionality}
          employees={employees}
          colors={colors}
          onClose={() => {
            setShowModal(false);
            setEditingFunctionality(null);
          }}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          colors={colors}
          error={deleteError}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => {
            setDeleteConfirm(null);
            setDeleteError(null);
          }}
        />
      )}
    </div>
  );
}