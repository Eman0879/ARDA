// ===== app/api/calendar/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import CalendarEvent from '@/models/CalendarEvent';

// GET - Fetch calendar events
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const completed = searchParams.get('completed');
    
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }
    
    const query: any = { userId };
    
    // Date range filter
    if (startDate && endDate) {
      query.startDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Type filter
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Completed filter
    if (completed !== null && completed !== undefined) {
      query.completed = completed === 'true';
    }
    
    // Uses compound indexes based on query:
    // - { userId: 1, type: 1, startDate: 1 } if type is specified
    // - { userId: 1, completed: 1, startDate: 1 } if completed is specified
    // - { userId: 1, startDate: 1 } otherwise
    const events = await CalendarEvent.find(query)
      .sort({ startDate: 1 })
      .lean();
    
    return NextResponse.json({ events, success: true });
  } catch (error: any) {
    console.error('Calendar GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { userId, username, title, description, type, startDate, endDate, startTime, endTime, color, isAllDay, reminder } = body;
    
    // Validation
    if (!userId || !username || !title || !type || !startDate || !color) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const event = await CalendarEvent.create({
      userId,
      username,
      title,
      description,
      type,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      startTime,
      endTime,
      color,
      isAllDay: isAllDay || false,
      completed: false,
      reminder: reminder || { enabled: false, minutesBefore: 15 }
    });
    
    return NextResponse.json({ event, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Calendar POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update event
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { _id, ...updateData } = body;
    
    if (!_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Convert date strings to Date objects
    if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
    if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);
    
    // Uses primary key index (_id)
    const event = await CalendarEvent.findByIdAndUpdate(_id, updateData, { new: true });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ event, success: true });
  } catch (error: any) {
    console.error('Calendar PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete event
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    
    // Uses primary key index (_id)
    const event = await CalendarEvent.findByIdAndDelete(id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    console.error('Calendar DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

