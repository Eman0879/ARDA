// ===== app/api/sprints/route.js =====
import dbConnect from '@/lib/mongoose';
import Sprint from '@/models/Sprint';
import { NextResponse } from 'next/server';
import { createCalendarEventsWithTracking } from '@/app/utils/calendarSync';

// GET - Fetch sprints with department isolation
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    
    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department parameter is required' },
        { status: 400 }
      );
    }
    
    // Build query with department isolation
    const query = { department };
    
    // Filter by assignee if employeeId provided
    if (employeeId) {
      query['assignees.employeeId'] = employeeId;
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Uses compound indexes:
    // - { department: 1, status: 1, priority: -1 } if status filter
    // - { 'assignees.employeeId': 1, status: 1, dueDate: 1 } if employeeId filter
    const sprints = await Sprint.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: sprints 
    });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new sprint
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.department || !body.dueDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate assignees
    if (!body.assignees || body.assignees.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one assignee is required' },
        { status: 400 }
      );
    }
    
    const sprint = await Sprint.create(body);
    
    // Create calendar events
    if (sprint.assignees && sprint.assignees.length > 0) {
      try {
        await createCalendarEventsWithTracking(sprint._id.toString(), {
          title: sprint.title,
          description: sprint.description,
          type: 'sprint',
          startDate: sprint.startDate || undefined,
          dueDate: sprint.dueDate,
          assignees: sprint.assignees,
          createdBy: sprint.createdBy
        });
        console.log(`✓ Calendar events created for sprint: ${sprint.title}`);
      } catch (calError) {
        console.error('Error creating calendar events:', calError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: sprint 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}