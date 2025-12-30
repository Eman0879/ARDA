// app/api/employee-tickets/route.ts
// FINAL VERSION: Uses primaryCredit and secondaryCredits fields
// Much simpler and clearer!

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Ticket from '@/models/Ticket';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    console.log('\n========================================');
    console.log('🎫 EMPLOYEE TICKET ANALYTICS (SIMPLE VERSION)');
    console.log('========================================');
    console.log('Employee ID:', employeeId);
    console.log('Time:', new Date().toISOString());
    console.log('========================================\n');

    // Get ALL tickets
    const allTickets = await Ticket.find({})
      .select('ticketNumber functionalityName status priority createdAt raisedBy primaryCredit secondaryCredits')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 Total tickets in system: ${allTickets.length}\n`);

    // Separate primary and secondary tickets
    const primaryTickets: any[] = [];
    const secondaryTickets: any[] = [];

    allTickets.forEach((ticket: any) => {
      console.log(`\n┌─────────────────────────────────────────┐`);
      console.log(`│ Ticket: ${ticket.ticketNumber}`);
      console.log(`│ Status: ${ticket.status}`);
      console.log(`└─────────────────────────────────────────┘`);
      
      // Rule 1: Exclude the person who raised the ticket
      if (ticket.raisedBy.userId === employeeId) {
        console.log(`❌ Employee RAISED this ticket → NO CREDIT\n`);
        return;
      }

      // Rule 2: Check primaryCredit
      if (ticket.primaryCredit && ticket.primaryCredit.userId === employeeId) {
        primaryTickets.push(ticket);
        console.log(`✅ Has PRIMARY credit\n`);
        return;
      }

      // Rule 3: Check secondaryCredits
      const hasSecondaryCredit = ticket.secondaryCredits && 
        ticket.secondaryCredits.some((c: any) => c.userId === employeeId);
      
      if (hasSecondaryCredit) {
        secondaryTickets.push(ticket);
        console.log(`✅ Has SECONDARY credit\n`);
        return;
      }

      console.log(`❌ No credit on this ticket\n`);
    });

    console.log(`\n========================================`);
    console.log(`📊 RESULTS`);
    console.log(`========================================`);
    console.log(`Primary Tickets: ${primaryTickets.length}`);
    console.log(`Secondary Tickets: ${secondaryTickets.length}`);
    console.log(`Total Tickets: ${primaryTickets.length + secondaryTickets.length}`);
    console.log(`========================================\n`);

    // Helper function to get status breakdown
    const getStatusBreakdown = (tickets: any[]) => {
      const breakdown: Record<string, number> = {
        pending: 0,
        'in-progress': 0,
        blocked: 0,
        resolved: 0,
        closed: 0,
      };

      tickets.forEach((ticket: any) => {
        if (ticket.status in breakdown) {
          breakdown[ticket.status]++;
        }
      });

      return breakdown;
    };

    // Helper function to format status breakdown
    const formatStatusBreakdown = (breakdown: Record<string, number>, total: number) => {
      const statusColors: Record<string, string> = {
        pending: '#FFA500',
        'in-progress': '#0000FF',
        blocked: '#FF0000',
        resolved: '#32CD32',
        closed: '#808080',
      };

      return Object.entries(breakdown)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          status,
          count,
          color: statusColors[status] || '#808080',
          percentage: total > 0 ? (count / total) * 100 : 0,
        }));
    };

    // Helper function to get recent tickets
    const getRecentTickets = (tickets: any[], contributorType: 'primary' | 'secondary') => {
      return tickets.slice(0, 10).map((ticket: any) => ({
        ticketNumber: ticket.ticketNumber,
        functionalityName: ticket.functionalityName,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt,
        role: contributorType === 'primary' ? 'assignee' : 'group_member',
        contributorType: contributorType,
      }));
    };

    // Calculate breakdowns
    const primaryStatusBreakdown = getStatusBreakdown(primaryTickets);
    const secondaryStatusBreakdown = getStatusBreakdown(secondaryTickets);
    
    const totalTickets = primaryTickets.length + secondaryTickets.length;

    console.log('Primary Status Breakdown:');
    Object.entries(primaryStatusBreakdown).forEach(([status, count]) => {
      if (count > 0) {
        console.log(`  ${status}: ${count}`);
      }
    });
    console.log('\nSecondary Status Breakdown:');
    Object.entries(secondaryStatusBreakdown).forEach(([status, count]) => {
      if (count > 0) {
        console.log(`  ${status}: ${count}`);
      }
    });
    console.log('');

    return NextResponse.json({
      employeeId,
      totalTickets,
      
      // Primary tickets data
      primaryTickets: {
        total: primaryTickets.length,
        statusBreakdown: formatStatusBreakdown(primaryStatusBreakdown, primaryTickets.length),
        recentTickets: getRecentTickets(primaryTickets, 'primary'),
      },
      
      // Secondary tickets data
      secondaryTickets: {
        total: secondaryTickets.length,
        statusBreakdown: formatStatusBreakdown(secondaryStatusBreakdown, secondaryTickets.length),
        recentTickets: getRecentTickets(secondaryTickets, 'secondary'),
      },
      
      // Overall status breakdown (for backward compatibility)
      statusBreakdown: formatStatusBreakdown({
        pending: primaryStatusBreakdown.pending + secondaryStatusBreakdown.pending,
        'in-progress': primaryStatusBreakdown['in-progress'] + secondaryStatusBreakdown['in-progress'],
        blocked: primaryStatusBreakdown.blocked + secondaryStatusBreakdown.blocked,
        resolved: primaryStatusBreakdown.resolved + secondaryStatusBreakdown.resolved,
        closed: primaryStatusBreakdown.closed + secondaryStatusBreakdown.closed,
      }, totalTickets),
      
      // Combined recent tickets
      recentTickets: [
        ...getRecentTickets(primaryTickets, 'primary'),
        ...getRecentTickets(secondaryTickets, 'secondary')
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
    });
  } catch (error) {
    console.error('❌ Error fetching employee tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee ticket data' },
      { status: 500 }
    );
  }
}