// ============================================
// app/components/ticketing/AssignedTicketsContent.tsx
// Shows and manages tickets assigned to current user
// UPDATED WITH APPOINTMENTS-STYLE HEADER AND THEME CONTEXT
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Ticket as TicketIcon, 
  Loader2, 
  AlertCircle, 
  Search, 
  X,
  SlidersHorizontal,
  ArrowUpDown,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import TicketActionsPanel from './TicketActionsPanel';

interface Ticket {
  _id: string;
  ticketNumber: string;
  functionalityName: string;
  status: string;
  priority: string;
  workflowStage: string;
  raisedBy: {
    name: string;
    userId: string;
  };
  createdAt: string;
  blockers: any[];
  currentAssignee: string;
  currentAssignees: string[];
  groupLead: string | null;
  functionality: any;
  workflowHistory: any[];
  contributors: Array<{
    userId: string;
    name: string;
    role: string;
    joinedAt: Date;
    leftAt?: Date;
  }>;
}

interface AssignedTicketsContentProps {
  onBack?: () => void;
}

export default function AssignedTicketsContent({ onBack }: AssignedTicketsContentProps) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [fetchingUserId, setFetchingUserId] = useState(false);
  
  // Filter and search states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Unique functionalities for filter
  const [functionalities, setFunctionalities] = useState<string[]>([]);
  const [functionalityFilter, setFunctionalityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUserId = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setError('Please log in again');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const identifier = user.username || user._id || user.id || user.userId;
      
      if (!identifier) {
        setError('Unable to identify user. Please log in again.');
        setLoading(false);
        return;
      }
      
      try {
        setFetchingUserId(true);
        const response = await fetch(`/api/users/get-user-id?identifier=${encodeURIComponent(identifier)}`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          setError('Server error: API route not found.');
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        if (response.ok) {
          user._id = data.userId;
          localStorage.setItem('user', JSON.stringify(user));
          
          setUserId(data.userId);
          setUserName(data.username);
        } else {
          setError(`Unable to fetch user ID: ${data.error || 'Unknown error'}`);
          setLoading(false);
        }
      } catch (error) {
        setError(`Failed to fetch user information.`);
        setLoading(false);
      } finally {
        setFetchingUserId(false);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTickets();
    }
  }, [userId]);

  useEffect(() => {
    applyFilters();
  }, [tickets, statusFilter, searchQuery, priorityFilter, functionalityFilter, sortBy, sortOrder]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/assigned?userId=${userId}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error: Invalid response format.');
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tickets');
      }

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
        t.raisedBy.name.toLowerCase().includes(query)
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
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <TicketIcon className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFD700';
      case 'in-progress': return '#0000FF';
      case 'blocked': return '#FF0000';
      case 'resolved': return '#00FF00';
      default: return '#6495ED';
    }
  };

  if (loading || fetchingUserId) {
    return (
      <div className="min-h-screen p-4 md:p-6 space-y-4">
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${charColors.bg} ${charColors.border} ${colors.shadowCard} p-8`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <h2 className={`text-xl font-black ${charColors.text} mb-2`}>Assigned Tickets</h2>
            <p className={`text-sm ${colors.textMuted}`}>
              {fetchingUserId ? 'Fetching your user ID...' : 'Loading tickets...'}
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
              {fetchingUserId ? 'Looking up your account...' : 'Loading tickets...'}
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
          <h2 className={`text-xl font-black ${charColors.text}`}>Assigned Tickets</h2>
        </div>
        <div className={`relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.urgent.bg} ${cardCharacters.urgent.border} p-10 text-center`}>
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          <div className="relative">
            <div className="mb-6">
              <AlertCircle className={`w-16 h-16 mx-auto ${cardCharacters.urgent.iconColor}`} />
            </div>
            <h3 className={`text-xl font-black ${cardCharacters.urgent.text} mb-3`}>Unable to Load Tickets</h3>
            <p className={`${colors.textSecondary} text-sm mb-6`}>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={`group relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 overflow-hidden border-2 inline-flex items-center gap-2 bg-gradient-to-r ${colors.buttonPrimary} ${colors.buttonPrimaryText}`}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
              ></div>
              <RefreshCw className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:rotate-180" />
              <span className="relative z-10">Retry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                <h1 className={`text-xl font-black ${charColors.text}`}>Assigned Tickets</h1>
                <p className={`text-xs ${colors.textMuted}`}>
                  {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} requiring your attention
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
                  placeholder="Search by ticket number, functionality, or raised by..."
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

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${colors.inputBg} border ${colors.inputBorder} ${colors.inputText}`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="resolved">Resolved</option>
              </select>

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
                : "No tickets assigned"}
            </p>
            <p className={`${colors.textSecondary} text-sm mb-4`}>
              {searchQuery || activeFiltersCount > 0
                ? 'Try adjusting your search or filters'
                : 'You have no pending tickets at the moment'}
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
            const statusColor = getStatusColor(ticket.status);
            const isGroupLead = ticket.groupLead === userId;
            const isInGroup = ticket.currentAssignees && ticket.currentAssignees.length > 1;
            const hasUnresolvedBlockers = ticket.blockers?.some((b: any) => !b.isResolved);
            
            return (
              <div
                key={ticket._id}
                onClick={() => setSelectedTicket(ticket)}
                className={`group relative overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${cardCharacters.neutral.bg} ${cardCharacters.neutral.border} p-5 ${colors.shadowCard} hover:${colors.shadowHover} transition-all duration-300 cursor-pointer hover:scale-[1.01]`}
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
                        className={`p-2 rounded-lg transition-transform duration-300 group-hover:scale-110`}
                        style={{ 
                          backgroundColor: `${statusColor}20`,
                          color: statusColor
                        }}
                      >
                        {getStatusIcon(ticket.status)}
                      </div>
                      
                      <h4 className={`text-lg font-black ${colors.textPrimary}`}>
                        {ticket.ticketNumber}
                      </h4>
                      
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-bold"
                        style={{
                          backgroundColor: `${statusColor}25`,
                          color: statusColor
                        }}
                      >
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </div>
                      
                      {isInGroup && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r ${cardCharacters.creative.bg} ${cardCharacters.creative.text}`}>
                          {isGroupLead ? '👑 GROUP LEAD' : '👥 GROUP MEMBER'}
                        </div>
                      )}
                      
                      {hasUnresolvedBlockers && (
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-gradient-to-r ${cardCharacters.urgent.bg} ${cardCharacters.urgent.text}`}>
                          <AlertTriangle className="w-3 h-3" />
                          BLOCKED
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
                      <span>By {ticket.raisedBy.name}</span>
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

      {/* Actions Panel Modal */}
      {selectedTicket && (
        <TicketActionsPanel
          ticket={selectedTicket}
          userId={userId}
          userName={userName}
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