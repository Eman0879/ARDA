// ===== app/api/appointments/route.ts =====
import Appointment from '@/models/Appointment';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

// GET - Fetch appointments
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const view = searchParams.get('view'); // 'sent', 'received', 'all'
    const status = searchParams.get('status'); // optional filter
    
    if (!username) {
      return NextResponse.json({ error: 'username is required' }, { status: 400 });
    }
    
    let query: any = {};
    
    // Add status filter if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    let appointments;
    
    if (view === 'sent') {
      // Uses compound index: { requesterUsername: 1, status: 1, proposedDate: 1 }
      // or { requesterUsername: 1, createdAt: -1 }
      appointments = await Appointment.find({
        requesterUsername: username,
        ...query
      })
      .sort({ createdAt: -1 })
      .lean();
    } else if (view === 'received') {
      // Uses compound index: { requestedUsername: 1, status: 1, proposedDate: 1 }
      // or { requestedUsername: 1, createdAt: -1 }
      appointments = await Appointment.find({
        requestedUsername: username,
        ...query
      })
      .sort({ createdAt: -1 })
      .lean();
    } else {
      // For 'all' view, we need both sent and received
      // This uses both indexes: requesterUsername and requestedUsername
      appointments = await Appointment.find({
        $or: [
          { requesterUsername: username, ...query },
          { requestedUsername: username, ...query }
        ]
      })
      .sort({ createdAt: -1 })
      .lean();
    }
    
    return NextResponse.json({ appointments, success: true });
  } catch (error: any) {
    console.error('Appointments GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create appointment request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { requesterId, requesterUsername, requestedId, requestedUsername, title, description, proposedDate, proposedStartTime, proposedEndTime } = body;
    
    // Validation
    if (!requesterId || !requesterUsername || !requestedId || !requestedUsername || !title || !proposedDate || !proposedStartTime || !proposedEndTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const appointment = await Appointment.create({
      requesterId,
      requesterUsername,
      requestedId,
      requestedUsername,
      title,
      description,
      proposedDate: new Date(proposedDate),
      proposedStartTime,
      proposedEndTime,
      status: 'pending',
      currentOwner: requestedUsername,
      history: [{
        action: 'created',
        by: requesterUsername,
        timestamp: new Date(),
        details: { proposedDate, proposedStartTime, proposedEndTime }
      }]
    });
    
    return NextResponse.json({ appointment, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Appointments POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
