// ============================================
// app/components/ticketing/TicketActionsPanel.tsx
// Main panel with tabs - Details first, then Actions
// Orchestrates TicketDetailsView and TicketActionsList
// UPDATED WITH THEME CONTEXT
// ============================================

'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
import TicketDetailsView from './TicketDetailsView';
import TicketActionsList from './TicketActionsList';

interface Ticket {
  _id: string;
  ticketNumber: string;
  functionalityName: string;
  status: string;
  workflowStage: string;
  currentAssignee: string;
  currentAssignees: string[];
  groupLead: string | null;
  functionality: any;
  raisedBy: {
    name: string;
    userId: string;
  };
  formData?: Record<string, any>;
  workflowHistory: any[];
  blockers: any[];
  createdAt: string;
}

interface Props {
  ticket: Ticket;
  userId: string;
  userName: string;
  onClose: () => void;
  onUpdate: () => void;
}

interface WorkflowPosition {
  isFirst: boolean;
  isLast: boolean;
  canForward: boolean;
  canRevert: boolean;
  nextNodeType: string | null;
  prevNodeType: string | null;
}

export default function TicketActionsPanel({ ticket, userId, userName, onClose, onUpdate }: Props) {
  const { colors, cardCharacters } = useTheme();
  const charColors = cardCharacters.informative;
  
  const [activeTab, setActiveTab] = useState<'details' | 'actions'>('details');
  const [loading, setLoading] = useState(false);

  // Workflow analysis
  const [workflowPosition, setWorkflowPosition] = useState<WorkflowPosition>({
    isFirst: false,
    isLast: false,
    canForward: false,
    canRevert: false,
    nextNodeType: null,
    prevNodeType: null
  });

  // Permission states
  const [isGroupLead, setIsGroupLead] = useState(false);
  const [isGroupMember, setIsGroupMember] = useState(false);
  const [canTakeActions, setCanTakeActions] = useState(false);

  useEffect(() => {
    analyzeWorkflowPosition();
    analyzePermissions();
  }, [ticket, userId]);

  const analyzePermissions = () => {
    const inGroup = ticket.currentAssignees && ticket.currentAssignees.length > 1;
    const isLead = ticket.groupLead === userId;
    const isMember = ticket.currentAssignees?.includes(userId);
    
    setIsGroupLead(isLead);
    setIsGroupMember(inGroup && isMember);
    setCanTakeActions(!inGroup || isLead);
  };

  const analyzeWorkflowPosition = () => {
    if (!ticket.functionality?.workflow) return;

    const workflow = ticket.functionality.workflow;
    const currentNodeIndex = workflow.nodes.findIndex((n: any) => n.id === ticket.workflowStage);
    const currentNode = workflow.nodes[currentNodeIndex];

    const employeeNodes = workflow.nodes.filter((n: any) => n.type === 'employee');
    const firstEmployeeNode = employeeNodes[0];
    const lastEmployeeNode = employeeNodes[employeeNodes.length - 1];

    const isFirst = currentNode?.id === firstEmployeeNode?.id;
    const isLast = currentNode?.id === lastEmployeeNode?.id;

    const nextEdge = workflow.edges.find((e: any) => e.source === ticket.workflowStage);
    let nextNode = null;
    let nextNodeType = null;
    if (nextEdge) {
      nextNode = workflow.nodes.find((n: any) => n.id === nextEdge.target);
      nextNodeType = nextNode?.type || null;
    }

    const prevEdge = workflow.edges.find((e: any) => e.target === ticket.workflowStage);
    let prevNode = null;
    let prevNodeType = null;
    if (prevEdge) {
      prevNode = workflow.nodes.find((n: any) => n.id === prevEdge.source);
      prevNodeType = prevNode?.type || null;
    }

    const canForward = !!nextEdge && nextNode;
    const canRevert = !!prevEdge && prevNode && prevNode.type !== 'start';

    setWorkflowPosition({
      isFirst,
      isLast,
      canForward,
      canRevert,
      nextNodeType,
      prevNodeType
    });
  };

  const performAction = async (action: string, payload: any) => {
    try {
      setLoading(true);

      const response = await fetch(`/api/tickets/${ticket._id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Action failed');
      }

      alert('✅ Action performed successfully!');
      onUpdate();
    } catch (error) {
      console.error('Error performing action:', error);
      alert(error instanceof Error ? error.message : 'Failed to perform action');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className="w-full max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border-2 animate-in zoom-in duration-300 bg-white dark:bg-[#0a0a1a]"
        style={{ borderColor: charColors.border.replace('border-', '') }}
      >
        {/* Header */}
        <div 
          className={`relative overflow-hidden p-6 border-b-2 flex items-center justify-between bg-gradient-to-br ${charColors.bg} backdrop-blur-sm`}
          style={{ borderColor: charColors.border.replace('border-', '') }}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.03]`}></div>
          
          <div className="relative flex-1">
            <h2 className={`text-2xl font-black ${charColors.text} mb-1`}>
              {ticket.ticketNumber}
            </h2>
            <p className={`text-sm ${colors.textSecondary}`}>
              {ticket.functionalityName}
            </p>
            {isGroupMember && (
              <p className={`text-xs mt-2 font-semibold flex items-center gap-1.5 ${cardCharacters.creative.text}`}>
                {isGroupLead ? '👑 Group Lead' : '👥 Group Member'}
              </p>
            )}
          </div>
          
          <button
            onClick={onClose}
            className={`group relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden border-2 bg-gradient-to-br ${colors.cardBg} ${cardCharacters.urgent.border} hover:${cardCharacters.urgent.border}`}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 20px ${colors.glowWarning}` }}
            ></div>
            <X className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:rotate-90 ${cardCharacters.urgent.iconColor}`} />
          </button>
        </div>

        {/* Tabs */}
        <div 
          className={`relative flex border-b-2 bg-gradient-to-br ${colors.cardBg} backdrop-blur-sm`}
          style={{ borderColor: charColors.border.replace('border-', '') }}
        >
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3.5 font-bold text-sm transition-all duration-300 relative ${
              activeTab === 'details'
                ? charColors.accent
                : colors.textSecondary
            }`}
          >
            {activeTab === 'details' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                style={{ backgroundColor: charColors.iconColor.replace('text-', '') }}
              />
            )}
            <span className="relative z-10">Details</span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 px-6 py-3.5 font-bold text-sm transition-all duration-300 relative ${
              activeTab === 'actions'
                ? charColors.accent
                : colors.textSecondary
            }`}
          >
            {activeTab === 'actions' && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 rounded-t-full"
                style={{ backgroundColor: charColors.iconColor.replace('text-', '') }}
              />
            )}
            <span className="relative z-10">Actions</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' ? (
            <TicketDetailsView 
              ticket={ticket}
              workflowPosition={workflowPosition}
            />
          ) : (
            <TicketActionsList
              ticket={ticket}
              userId={userId}
              userName={userName}
              workflowPosition={workflowPosition}
              canTakeActions={canTakeActions}
              isGroupLead={isGroupLead}
              isGroupMember={isGroupMember}
              onActionPerform={performAction}
              loading={loading}
            />
          )}
        </div>

        {/* Footer */}
        <div 
          className={`relative overflow-hidden p-6 border-t-2 bg-gradient-to-br ${colors.cardBg} backdrop-blur-sm`}
          style={{ borderColor: charColors.border.replace('border-', '') }}
        >
          <div className={`absolute inset-0 ${colors.paperTexture} opacity-[0.02]`}></div>
          
          <button
            onClick={onClose}
            className={`group relative w-full px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 overflow-hidden border-2 ${colors.inputBg} ${colors.inputBorder} ${colors.textPrimary}`}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ boxShadow: `inset 0 0 20px ${colors.glowPrimary}` }}
            ></div>
            <span className="relative z-10">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}