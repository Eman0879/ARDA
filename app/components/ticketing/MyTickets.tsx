// ============================================
// app/components/ticketing/MyTickets.tsx
// Shows ALL tickets created by current user (including closed)
// UPDATED WITH APPOINTMENTS-STYLE HEADER AND THEME CONTEXT
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket as TicketIcon, 
  Eye, 
  Loader2, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  Filter,
  RotateCcw,
  AlertTriangle,
  TrendingUp,
  Search,
  X,
  ArrowUpDown,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import CreatorTicketDetailModal from './CreatorTicketDetailModal';

interface Ticket {
  _id: string;
  ticketNumber: string;
  functionalityName: string;
  status: string;
  priority: string;
  workflowStage: string;
  createdAt: string;
  blockers: any[];
  currentAssignee: string;
  currentAssignees: string[];
  raisedBy: {
    userId: string;
    name: string;
  };
  functionality: any;
  workflowHistory: any[];
}

interface Props {
  userId: string;
  onBack?: () => void;
}

export default function MyTickets({ userId, onBack }: Props) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [userIdentifier, setUserIdentifier] = useState('');
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Unique functionalities for filter
  const [functionalities, setFunctionalities] = useState<string[]>([]);
  const [functionalityFilter, setFunctionalityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUserIdentifier = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) return;

      const user = JSON.parse(userData);
      const objectId = user._id || userId;
      setUserIdentifier(objectId);
    };

    fetchUserIdentifier();
  }, [userId]);

  useEffect(() => {
    fetchTickets();
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [tickets, statusFilter, searchQuery, priorityFilter, functionalityFilter, sortBy, sortOrder]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets?createdBy=${userId}`);
      
      if (!response.ok) throw new Error('Failed to fetch tickets');

      const data = await response.json();
      const fetchedTickets = data.tickets || [];
      setTickets(fetchedTickets);
      
      // Extract unique functionalities
      const uniqueFunctionalities = Array.from(
        new Set(fetchedTickets.map((t: Ticket) => t.functionalityName))
      ).sort();
      setFunctionalities(uniqueFunctionalities as string[]);
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.ticketNumber.toLowerCase().includes(query) ||
        t.functionalityName.toLowerCase().includes(query) ||
        t.workflowStage.toLowerCase().includes(query)
      );
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter);
    }

    if (functionalityFilter !== 'all') {
      filtered = filtered.filter(t => t.functionalityName === functionalityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'date':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aVal = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bVal = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'status':
          const statusOrder = { pending: 1, 'in-progress': 2, blocked: 3, resolved: 4, closed: 5 };
          aVal = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bVal = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredTickets(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setFunctionalityFilter('all');
    setSortBy('date');
    setSortOrder('desc');
  };

  const activeFiltersCount = [
    searchQuery,
    statusFilter !== 'all' ? statusFilter : '',
    priorityFilter !== 'all' ? priorityFilter : '',
    functionalityFilter !== 'all' ? functionalityFilter : ''
  ].filter(Boolean).length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <TrendingUp className="w-4 h-4" />;
      case 'blocked':
        return <AlertTriangle className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <TicketIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return cardCharacters.interactive;
      case 'in-progress': return cardCharacters.informative;
      case 'blocked': return cardCharacters.urgent;
      case 'resolved': return cardCharacters.completed;
      case 'closed': return cardCharacters.neutral;
      default: return cardCharacters.informative;
    }
  };

  const getStatusCounts = () => {
    return {
      all: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      'in-progress': tickets.filter(t => t.status === 'in-progress').length,
      blocked: tickets.filter(t => t.status === 'blocked').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-4">
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <h2 className={`text-xl font-black ${charColors.text} mb-2`}>My Tickets</h2>
            <p className={`text-sm ${colors.textMuted}`}>Loading your tickets...</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse`} style={{ backgroundColor: charColors.iconColor.replace('text-', '') }} />
              <Loader2 className={`relative w-12 h-12 animate-spin ${charColors.iconColor}`} />
            </div>
            <p className={`${colors.textSecondary} text-sm font-semibold`}>
              Loading your tickets...
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
          <h2 className={`text-xl font-black ${charColors.text}`}>My Tickets</h2>
        </div>
        
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} p-10 text-center`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <div className="mb-6">
              <AlertCircle className={`w-16 h-16 mx-auto ${cardCharacters.urgent.iconColor}`} />
            </div>
            
            <h3 className={`text-xl font-black ${cardCharacters.urgent.text} mb-3`}>
              Unable to Load Tickets
            </h3>
            <p className={`${colors.textSecondary} text-sm mb-6 max-w-md mx-auto`}>
              {error}
            </p>
            
            <button
              onClick={fetchTickets}
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

  const counts = getStatusCounts();

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-4">
      {/* Header with Back Button and Refresh */}
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
                <h1 className={`text-xl font-black ${charColors.text}`}>My Tickets</h1>
                <p className={`text-xs ${colors.textMuted}`}>
                  {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} created by you
                </p>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchTickets}
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
          </div>

          {/* Always Visible Filters */}
          <div className={`p-3 rounded-lg border ${charColors.border} bg-gradient-to-br ${colors.cardBg} backdrop-blur-sm`}>
            <div className="flex items-center space-x-2 mb-2">
              <Filter className={`h-4 w-4 ${colors.textMuted}`} />
              <span className={`text-xs font-bold ${colors.textSecondary}`}>Filters:</span>
            </div>
            
            {/* Search Bar */}
            <div className="mb-3">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${colors.textMuted}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ticket number, functionality, or stage..."
                  className={`w-full pl-10 pr-10 py-2 rounded-lg text-sm transition-all ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText} ${colors.inputPlaceholder}`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${colors.textMuted} hover:${cardCharacters.urgent.iconColor} transition-colors`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              <FilterButton
                label="All"
                count={counts.all}
                active={statusFilter === 'all'}
                onClick={() => setStatusFilter('all')}
              />
              <FilterButton
                label="Pending"
                count={counts.pending}
                active={statusFilter === 'pending'}
                onClick={() => setStatusFilter('pending')}
              />
              <FilterButton
                label="In Progress"
                count={counts['in-progress']}
                active={statusFilter === 'in-progress'}
                onClick={() => setStatusFilter('in-progress')}
              />
              <FilterButton
                label="Blocked"
                count={counts.blocked}
                active={statusFilter === 'blocked'}
                onClick={() => setStatusFilter('blocked')}
              />
              <FilterButton
                label="Resolved"
                count={counts.resolved}
                active={statusFilter === 'resolved'}
                onClick={() => setStatusFilter('resolved')}
              />
              <FilterButton
                label="Closed"
                count={counts.closed}
                active={statusFilter === 'closed'}
                onClick={() => setStatusFilter('closed')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Functionality Filter */}
              <select
                value={functionalityFilter}
                onChange={(e) => setFunctionalityFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
              >
                <option value="all">All Functionalities</option>
                {functionalities.map((func) => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              {/* Sort By */}
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
                >
                  <option value="date">Date</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className={`group relative px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 hover:scale-105 overflow-hidden border ${colors.inputBorder} ${colors.inputBg}`}
                >
                  <ArrowUpDown className={`w-4 h-4 relative z-10 transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''} ${charColors.iconColor}`} />
                </button>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={clearFilters}
                  className={`group relative px-4 py-1.5 rounded-lg font-bold text-xs transition-all duration-300 hover:scale-105 overflow-hidden border ${cardCharacters.urgent.border} ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text}`}
                >
                  Clear Filters ({activeFiltersCount})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} p-16 text-center`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <TicketIcon className={`w-16 h-16 ${colors.textMuted} mx-auto mb-4 opacity-40`} />
            <p className={`${colors.textPrimary} text-lg font-bold mb-2`}>
              {searchQuery || activeFiltersCount > 0
                ? "No tickets match your filters" 
                : statusFilter === 'all' 
                  ? "No tickets found" 
                  : `No ${statusFilter.replace('-', ' ')} tickets`}
            </p>
            <p className={`${colors.textSecondary} text-sm mb-4`}>
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : statusFilter === 'all' 
                  ? 'Create your first ticket to get started' 
                  : 'Try selecting a different filter'}
            </p>
            {(searchQuery || activeFiltersCount > 0) && (
              <button
                onClick={clearFilters}
                className={`group relative mt-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 overflow-hidden border-2 inline-flex items-center gap-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}
              >
                <span className="relative z-10">Clear All Filters</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const statusCharColors = getStatusColor(ticket.status);
            const isClosed = ticket.status === 'closed';
            const hasUnresolvedBlockers = ticket.blockers?.some((b: any) => !b.isResolved);
            
            return (
              <div
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.neutral.bg} ${cardCharacters.neutral.border} p-5 ${colors.shadowCard} hover:${colors.shadowHover} transition-all duration-300 cursor-pointer hover:scale-[1.01] ${isClosed ? 'opacity-70' : ''}`}
              >
                <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ boxShadow: `inset 0 0 30px ${colors.glowPrimary}` }}
                ></div>

                <div className="relative z-10 flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div 
                        className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110 bg-gradient-to-r ${statusCharColors.bg}`}
                      >
                        {getStatusIcon(ticket.status)}
                      </div>
                      
                      <h4 className={`text-lg font-black ${colors.textPrimary}`}>
                        {ticket.ticketNumber}
                      </h4>
                      
                      <div
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${statusCharColors.bg} ${statusCharColors.text}`}
                      >
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </div>
                      
                      {isClosed && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r ${cardCharacters.creative.bg} ${cardCharacters.creative.text}`}>
                          <RotateCcw className="w-3 h-3" />
                          Can Reopen
                        </div>
                      )}
                      
                      {hasUnresolvedBlockers && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {ticket.blockers.filter((b: any) => !b.isResolved).length} Blocker{ticket.blockers.filter((b: any) => !b.isResolved).length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <p className={`text-sm font-semibold ${colors.textSecondary} leading-relaxed`}>
                      {ticket.functionalityName}
                    </p>
                    
                    <div className={`flex items-center gap-4 text-xs font-medium ${colors.textMuted}`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          ticket.priority === 'high' ? 'bg-red-500' :
                          ticket.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}></div>
                        <span className="capitalize">{ticket.priority} Priority</span>
                      </div>
                      <span>•</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</span>
                    </div>
                  </div>
                  
                  <button
                    className={`group/btn relative p-3 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 overflow-hidden border-2 ml-4 bg-gradient-to-r ${charColors.bg} ${charColors.border}`}
                  >
                    <div 
                      className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
                      style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
                    ></div>
                    <Eye className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:scale-110 ${charColors.iconColor}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && userIdentifier && (
        <CreatorTicketDetailModal
          ticket={selectedTicket}
          userId={userIdentifier}
          onClose={() => setSelectedTicket(null)}
          onUpdate={() => {
            setSelectedTicket(null);
            fetchTickets();
          }}
        />
      )}
    </div>
  );
}

// Filter Button Component
interface FilterButtonProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function FilterButton({ label, count, active, onClick }: FilterButtonProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  return (
    <button
      onClick={onClick}
      className={`group relative px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 hover:scale-105 overflow-hidden border ${
        active
          ? `bg-gradient-to-r ${charColors.bg} ${charColors.border} ${charColors.text}`
          : `${colors.inputBg} ${colors.borderSubtle} ${colors.textSecondary}`
      }`}
    >
      {!active && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ boxShadow: `inset 0 0 20px ${colors.glowSecondary}` }}
        ></div>
      )}
      <span className="relative z-10">
        {label} <span className={`${active ? 'opacity-90' : 'opacity-60'}`}>({count})</span>
      </span>
    </button>
  );
}