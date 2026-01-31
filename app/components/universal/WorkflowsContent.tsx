// ============================================
// app/components/universal/WorkflowsContent.tsx
// Added onToggleActive handler and search bar
// ============================================

'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Search, X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import FunctionalityCard from './WorkflowComponents/FunctionalityCard';
import WorkflowModal from './WorkflowComponents/WorkflowModal';
import DeleteConfirmModal from './WorkflowComponents/DeleteConfirmModal';
import { Functionality, Employee } from './WorkflowComponents/types';

export default function WorkflowsContent() {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFunctionality, setEditingFunctionality] = useState<Functionality | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{message: string, count: number} | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleToggleActive = (id: string, newStatus: boolean) => {
    setFunctionalities(prev => 
      prev.map(f => f._id === id ? { ...f, isActive: newStatus } : f)
    );
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

  // Filter functionalities based on search
  const filteredFunctionalities = functionalities.filter((func) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      func.name.toLowerCase().includes(query) ||
      func.description?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-4">
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <h1 className={`text-4xl font-black ${charColors.text} mb-2`}>
              Workflow Management
            </h1>
            <p className={colors.textSecondary}>
              Loading functionalities and workflows...
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse`} style={{ backgroundColor: charColors.iconColor.replace('text-', '') }} />
              <Loader2 className={`relative w-12 h-12 animate-spin ${charColors.iconColor}`} />
            </div>
            <p className={`${colors.textSecondary} text-sm font-semibold`}>
              Loading workflows...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-6`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        <div className="relative">
          <h1 className={`text-4xl font-black ${charColors.text} mb-2`}>
            Workflow Management
          </h1>
          <p className={colors.textSecondary}>
            Create and manage ticketing functionalities with visual workflows
          </p>
        </div>
      </div>

      {updateMessage && (
        <div className={`relative overflow-hidden p-4 rounded-xl border-2 flex items-center gap-4 bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border}`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative flex items-start space-x-3">
            <AlertCircle className={`w-5 h-5 ${cardCharacters.completed.iconColor} mt-0.5 flex-shrink-0`} />
            <p className={`${colors.textPrimary} text-sm`}>{updateMessage}</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className={`relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.borderSubtle} p-4`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative">
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${colors.textMuted}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflows by name or description..."
              className={`w-full pl-12 pr-12 py-3 rounded-xl text-sm transition-all ${colors.inputBg} border-2 ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${colors.textMuted} hover:${cardCharacters.urgent.iconColor} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Results Count */}
          {searchQuery && (
            <div className={`mt-3 text-sm ${colors.textSecondary}`}>
              Showing {filteredFunctionalities.length} of {functionalities.length} workflows
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button
          onClick={handleCreate}
          className={`group relative overflow-hidden rounded-xl border-2 backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} hover:${colors.shadowHover} p-8 transition-all duration-300 hover:scale-105`}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
          ></div>
          <div className="relative flex flex-col items-center justify-center space-y-4 h-full min-h-[280px]">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 bg-gradient-to-r ${charColors.bg} border-2 ${charColors.border}`}>
              <Plus className={`w-10 h-10 ${charColors.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-xl font-black ${charColors.text} text-center`}>
                Create New Functionality
              </h3>
              <p className={`${colors.textSecondary} text-sm text-center mt-2`}>
                Build a custom workflow
              </p>
            </div>
          </div>
        </button>

        {filteredFunctionalities.map((func) => (
          <FunctionalityCard
            key={func._id}
            functionality={func}
            onEdit={handleEdit}
            onDelete={() => setDeleteConfirm(func._id)}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>

      {/* Empty State - No Results */}
      {filteredFunctionalities.length === 0 && functionalities.length > 0 && (
        <div className={`relative overflow-hidden rounded-2xl border-2 backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} p-16 text-center`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <Search className={`h-16 w-16 ${colors.textMuted} mx-auto mb-4 opacity-40`} />
            <p className={`${colors.textPrimary} text-lg font-bold mb-2`}>
              No workflows found
            </p>
            <p className={`${colors.textSecondary} text-sm`}>
              Try adjusting your search query
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <WorkflowModal
          functionality={editingFunctionality}
          employees={employees}
          onClose={() => {
            setShowModal(false);
            setEditingFunctionality(null);
          }}
          onSave={handleSave}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
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