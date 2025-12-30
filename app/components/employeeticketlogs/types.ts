// app/components/employeeticketlogs/types.ts
// UPDATED: Added primary/secondary ticket breakdown

// Status type alias matching database values
export type TicketStatusType = 'pending' | 'in-progress' | 'blocked' | 'resolved' | 'closed';

// Status colors mapping
export const STATUS_COLORS: Record<TicketStatusType, string> = {
  'pending': '#FFA500',      // Orange
  'in-progress': '#0000FF',  // Blue
  'blocked': '#FF0000',      // Red
  'resolved': '#32CD32',     // Green
  'closed': '#808080',       // Gray
};

// Status labels mapping
export const STATUS_LABELS: Record<TicketStatusType, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'blocked': 'Blocked',
  'resolved': 'Resolved',
  'closed': 'Closed',
};

export interface TicketStatus {
  status: string;
  count: number;
  color: string;
  percentage: number;
}

// Alias for backward compatibility
export interface TicketStatusCount extends TicketStatus {}

export interface RecentTicket {
  ticketNumber: string;
  functionalityName: string;
  status: string;
  priority: string;
  createdAt: string;
  role: 'assignee' | 'group_lead' | 'group_member';
  contributorType?: 'primary' | 'secondary'; // NEW
}

export interface TicketCollection {
  total: number;
  statusBreakdown: TicketStatus[];
  recentTickets: RecentTicket[];
}

export interface TicketAnalytics {
  employeeId: string;
  totalTickets: number;
  
  // NEW: Separate primary and secondary ticket data
  primaryTickets: TicketCollection;
  secondaryTickets: TicketCollection;
  
  // Overall data (for backward compatibility)
  statusBreakdown: TicketStatus[];
  recentTickets: RecentTicket[];
}

export interface EmployeeTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
}