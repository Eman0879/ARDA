// app/api/dept-tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Ticket from '@/models/Ticket';
import FormData from '@/models/FormData';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');

    if (!department) {
      return NextResponse.json(
        { error: 'Department is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get all tickets for the department with correct fields from schema
    const tickets = await Ticket.find({ department })
      .select('ticketNumber functionalityName status priority createdAt currentAssignee currentAssignees groupLead raisedBy blockers workflowStage')
      .sort({ createdAt: -1 })
      .lean();

    // Get unique assigned user IDs from currentAssignee and currentAssignees
    const assignedUserIds = [...new Set([
      ...tickets.map((ticket: any) => ticket.currentAssignee).filter(Boolean),
      ...tickets.flatMap((ticket: any) => ticket.currentAssignees || []).filter(Boolean)
    ])];

    // Fetch assignee names from FormData collection using _id
    const assignees = await FormData.find(
      { _id: { $in: assignedUserIds } },
      { _id: 1, 'basicDetails.name': 1 }
    ).lean();

    // Create a map of _id to name
    const userIdToNameMap: Record<string, string> = {};
    assignees.forEach((assignee: any) => {
      userIdToNameMap[assignee._id.toString()] = assignee.basicDetails?.name || 'Unknown';
    });

    // Add assignee names to tickets
    const ticketsWithNames = tickets.map((ticket: any) => {
      // Determine the primary assignee name
      let assignedToName = 'Unassigned';
      
      if (ticket.currentAssignee) {
        assignedToName = userIdToNameMap[ticket.currentAssignee] || 'Unknown';
      } else if (ticket.currentAssignees && ticket.currentAssignees.length > 0) {
        // If it's a group, show the group lead or first assignee
        const leadOrFirst = ticket.groupLead || ticket.currentAssignees[0];
        assignedToName = userIdToNameMap[leadOrFirst] || 'Unknown';
        
        // Add group indicator if multiple assignees
        if (ticket.currentAssignees.length > 1) {
          assignedToName = `${assignedToName} (+${ticket.currentAssignees.length - 1} others)`;
        }
      }

      return {
        ...ticket,
        assignedToName,
      };
    });

    // Calculate status breakdown
    const statusBreakdown: Record<string, number> = {
      pending: 0,
      'in-progress': 0,
      blocked: 0,
      resolved: 0,
      closed: 0,
    };

    tickets.forEach((ticket: any) => {
      if (ticket.status in statusBreakdown) {
        statusBreakdown[ticket.status]++;
      }
    });

    const total = tickets.length;

    const statusColors: Record<string, string> = {
      pending: '#FFA500',
      'in-progress': '#0000FF',
      blocked: '#FF0000',
      resolved: '#32CD32',
      closed: '#808080',
    };

    const formattedBreakdown = Object.entries(statusBreakdown)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({
        status,
        count,
        color: statusColors[status] || '#808080',
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));

    return NextResponse.json({
      department,
      totalTickets: total,
      statusBreakdown: formattedBreakdown,
      tickets: ticketsWithNames,
    });
  } catch (error) {
    console.error('Error fetching department tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department ticket data' },
      { status: 500 }
    );
  }
}