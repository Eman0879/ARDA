// ============================================
// app/components/ticketing/TicketingContent.tsx
// Main ticketing interface with search and filters
// UPDATED WITH THEME CONTEXT
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, X, Loader2, TicketIcon, 
  SlidersHorizontal, AlertCircle,
  List, Plus, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import FunctionalityCard from './FunctionalityCard';
import TicketFormModal from './TicketFormModal';
import MyTicketsWrapper from './MyTicketsWrapper';

interface Functionality {
  _id: string;
  name: string;
  description: string;
  department: string;
  formSchema: {
    fields: any[];
    useDefaultFields: boolean;
  };
  createdAt: string;
}

interface TicketingContentProps {
  onBack?: () => void;
}

export default function TicketingContent({ onBack }: TicketingContentProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [functionalities, setFunctionalities] = useState<Functionality[]>([]);
  const [filteredFunctionalities, setFilteredFunctionalities] = useState<Functionality[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'my-tickets'>('create');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal
  const [selectedFunctionality, setSelectedFunctionality] = useState<Functionality | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [createdTicketNumber, setCreatedTicketNumber] = useState('');

  // Get user data
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user._id || user.id || user.userId || user.username);
    }
  }, []);

  useEffect(() => {
    fetchFunctionalities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [functionalities, searchQuery, selectedDepartment, sortBy, sortOrder]);

  const fetchFunctionalities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ticketing/functionalities');
      
      if (!response.ok) throw new Error('Failed to fetch functionalities');

      const data = await response.json();
      setFunctionalities(data.functionalities || []);
      setDepartments(data.departments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...functionalities];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(f => 
        f.name.toLowerCase().includes(query) ||
        f.description?.toLowerCase().includes(query) ||
        f.department.toLowerCase().includes(query)
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(f => f.department === selectedDepartment);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'department':
          aVal = a.department.toLowerCase();
          bVal = b.department.toLowerCase();
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredFunctionalities(filtered);
  };

  const handleTicketSuccess = (ticketNumber: string) => {
    setCreatedTicketNumber(ticketNumber);
    setShowSuccessMessage(true);
    setSelectedFunctionality(null);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-4">
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative flex items-center space-x-3">
            <button
              onClick={handleBack}
              className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
            </button>
            
            <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
              <TicketIcon className={`h-5 w-5 ${charColors.iconColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-black ${charColors.text}`}>Create Ticket</h2>
              <p className={`text-sm ${colors.textMuted}`}>Loading functionalities...</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse`} style={{ backgroundColor: charColors.iconColor.replace('text-', '') }} />
              <Loader2 className={`relative w-12 h-12 animate-spin ${charColors.iconColor}`} />
            </div>
            <p className={`${colors.textSecondary} text-sm font-semibold`}>
              Loading functionalities...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-4">
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative flex items-center space-x-3">
            <button
              onClick={handleBack}
              className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
              ></div>
              <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
            </button>
            
            <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
              <TicketIcon className={`h-5 w-5 ${charColors.iconColor}`} />
            </div>
            <div>
              <h2 className={`text-xl font-black ${charColors.text}`}>Create Ticket</h2>
            </div>
          </div>
        </div>

        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} p-10 text-center`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <div className="mb-6">
              <AlertCircle className={`w-16 h-16 mx-auto ${cardCharacters.urgent.iconColor}`} />
            </div>
            <h3 className={`text-xl font-black ${cardCharacters.urgent.text} mb-3`}>
              Error Loading Functionalities
            </h3>
            <p className={`${colors.textSecondary} text-sm mb-6 max-w-md mx-auto`}>
              {error}
            </p>
            <button 
              onClick={fetchFunctionalities}
              className={`group relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 overflow-hidden border-2 inline-flex items-center gap-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}
            >
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
              ></div>
              <RefreshCw className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-180" />
              <span className="relative z-10">Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeFiltersCount = [searchQuery, selectedDepartment].filter(Boolean).length;

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">
      {/* Header with Back Button and Tab Navigation */}
      <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} transition-all duration-300`}>
        <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
        
        <div className="relative p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Back Button */}
              <button
                onClick={handleBack}
                className={`group relative flex items-center justify-center p-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-br ${colors.cardBg} border ${charColors.border} ${colors.borderHover} backdrop-blur-sm ${colors.shadowCard} hover:${colors.shadowHover}`}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                ></div>
                <ArrowLeft className={`h-5 w-5 relative z-10 transition-transform duration-300 group-hover:-translate-x-1 ${charColors.iconColor}`} />
              </button>

              <div className={`p-2 rounded-lg bg-gradient-to-r ${charColors.bg}`}>
                <TicketIcon className={`h-5 w-5 ${charColors.iconColor}`} />
              </div>
              <div>
                <h1 className={`text-xl font-black ${charColors.text}`}>Ticketing System</h1>
                <p className={`text-xs ${colors.textMuted}`}>
                  {activeTab === 'create' 
                    ? `${filteredFunctionalities.length} functionalities available`
                    : 'View and manage your tickets'}
                </p>
              </div>
            </div>
            
            {/* Refresh Button - only on create tab */}
            {activeTab === 'create' && (
              <button
                onClick={fetchFunctionalities}
                disabled={loading}
                className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 overflow-hidden bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText} border border-transparent ${colors.shadowCard} hover:${colors.shadowHover} disabled:opacity-50`}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}, inset 0 0 28px ${colors.glowPrimary}` }}
                ></div>
                <RefreshCw className={`h-4 w-4 relative z-10 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                <span className="text-sm font-bold relative z-10">Refresh</span>
              </button>
            )}
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`group relative flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                activeTab === 'create'
                  ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                  : `${colors.inputBg} ${colors.textSecondary} hover:bg-opacity-60`
              }`}
            >
              {activeTab === 'create' && (
                <>
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                </>
              )}
              <Plus className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Create New Ticket</span>
            </button>
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`group relative flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 overflow-hidden ${
                activeTab === 'my-tickets'
                  ? `bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`
                  : `${colors.inputBg} ${colors.textSecondary} hover:bg-opacity-60`
              }`}
            >
              {activeTab === 'my-tickets' && (
                <>
                  <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 14px ${colors.glowPrimary}` }}
                  ></div>
                </>
              )}
              <List className="w-4 h-4 relative z-10" />
              <span className="relative z-10">My Tickets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div 
          className={`relative overflow-hidden p-4 rounded-xl border-2 flex items-center gap-4 animate-in slide-in-from-top bg-gradient-to-br ${cardCharacters.completed.bg} ${cardCharacters.completed.border}`}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-r ${cardCharacters.completed.bg}`}>
              <TicketIcon className={`w-6 h-6 ${cardCharacters.completed.iconColor}`} />
            </div>
          </div>
          <div className="relative flex-1">
            <p className={`font-bold ${cardCharacters.completed.text}`}>Ticket Created Successfully!</p>
            <p className={`text-sm ${colors.textSecondary}`}>
              Your ticket <span className={`font-mono font-bold ${cardCharacters.completed.text}`}>{createdTicketNumber}</span> has been submitted.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessMessage(false)}
            className={`relative flex-shrink-0 ${colors.textMuted} hover:${cardCharacters.urgent.iconColor} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Content Area - Conditional based on active tab */}
      {activeTab === 'create' ? (
        <>
          {/* Search and Filters */}
          <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.borderSubtle} p-4`}>
            <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
            
            <div className="relative space-y-4">
              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${colors.textMuted}`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search functionalities..."
                    className={`w-full pl-12 pr-4 py-3 rounded-xl text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${colors.textMuted} hover:${cardCharacters.urgent.iconColor} transition-colors`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <button
                  className={`group relative px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 border-2 transition-all hover:scale-105 overflow-hidden ${
                    activeFiltersCount > 0 
                      ? `border ${charColors.border} bg-gradient-to-r ${charColors.bg} ${charColors.text}` 
                      : `${colors.inputBorder} ${colors.inputBg} ${colors.textPrimary}`
                  }`}
                >
                  {activeFiltersCount === 0 && (
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `inset 0 0 20px ${colors.glowSecondary}` }}
                    ></div>
                  )}
                  <SlidersHorizontal className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold bg-white dark:bg-black bg-opacity-30`}>
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Filter Panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-2`}>
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-2`}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                  >
                    <option value="createdAt">Date Created</option>
                    <option value="name">Name</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-bold ${colors.textSecondary} mb-2`}>
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:scale-105 bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text}`}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Functionalities Grid */}
          {filteredFunctionalities.length === 0 ? (
            <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${colors.cardBg} ${colors.borderSubtle} p-16 text-center`}>
              <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
              <div className="relative">
                <Filter className={`h-20 w-20 ${colors.textMuted} mx-auto mb-6 opacity-50`} />
                <p className={`${colors.textPrimary} text-xl font-semibold mb-2`}>
                  No functionalities found
                </p>
                <p className={`${colors.textSecondary} text-sm`}>
                  Try adjusting your filters or search query
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFunctionalities.map((functionality) => (
                <FunctionalityCard
                  key={functionality._id}
                  functionality={functionality}
                  onClick={() => setSelectedFunctionality(functionality)}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* My Tickets Tab */
        <MyTicketsWrapper onBack={() => setActiveTab('create')} />
      )}

      {/* Ticket Form Modal */}
      {selectedFunctionality && (
        <TicketFormModal
          functionality={selectedFunctionality}
          onClose={() => setSelectedFunctionality(null)}
          onSuccess={handleTicketSuccess}
        />
      )}
    </div>
  );
}