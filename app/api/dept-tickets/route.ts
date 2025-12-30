// app/api/dept-tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Ticket from '@/models/Ticket';

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

    // Get all tickets for the department
    const tickets = await Ticket.find({ department })
      .select('ticketNumber status priority createdAt')
      .sort({ createdAt: -1 })
      .lean();

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
    });
  } catch (error) {
    console.error('Error fetching department tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department ticket data' },
      { status: 500 }
    );
  }
}