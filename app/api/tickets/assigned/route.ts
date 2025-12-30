// ===== app/api/tickets/assigned/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

// CRITICAL: Import models in the correct order
// Functionality MUST be imported before Ticket
import '@/models/Functionality';  // Force registration
import Ticket from '@/models/Ticket';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching assigned tickets for userId:', userId);

    // Build query
    const query: any = {
      $or: [
        { currentAssignee: userId },
        { currentAssignees: { $in: [userId] } }
      ],
      status: { $nin: ['closed'] }
    };

    // Apply status filter if provided
    if (status && status !== 'all') {
      // Map widget status names to actual schema status values
      const statusArray = status.split(',').map(s => {
        const normalized = s.trim().toLowerCase();
        // Map common status aliases to actual schema values
        if (normalized === 'open' || normalized === 'new' || normalized === 'assigned') {
          return 'pending';
        }
        if (normalized === 'in progress') {
          return 'in-progress';
        }
        return normalized;
      });
      
      // Remove duplicates and filter out 'closed'
      const uniqueStatuses = [...new Set(statusArray)].filter(s => s !== 'closed');
      
      if (uniqueStatuses.length > 0) {
        query.status = { $in: uniqueStatuses };
      }
    }

    console.log('📋 Query:', JSON.stringify(query, null, 2));

    // Uses compound indexes:
    // - { currentAssignee: 1, status: 1, createdAt: -1 }
    // - { currentAssignees: 1, status: 1, createdAt: -1 }
    const tickets = await Ticket.find(query)
      .populate('functionality', 'name workflow department')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`✅ Found ${tickets.length} assigned tickets`);

    // Format tickets
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      _id: ticket._id.toString(),
      title: ticket.functionalityName, // Add title field for widget
      functionality: ticket.functionality ? {
        ...ticket.functionality,
        _id: ticket.functionality._id.toString()
      } : null
    }));

    return NextResponse.json({
      success: true,
      tickets: formattedTickets,
      count: formattedTickets.length
    });
  } catch (error) {
    console.error('❌ Error fetching assigned tickets:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch tickets', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}