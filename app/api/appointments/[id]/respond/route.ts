
// ===== app/api/appointments/[id]/respond/route.ts =====
import Appointment from '@/models/Appointment';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import CalendarEvent from '@/models/CalendarEvent';

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id: appointmentId } = await params;
    
    const body = await request.json();
    const { action, username, reason, counterProposal } = body;
    
    // Uses primary key index (_id)
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Verify user has permission to respond
    if (appointment.currentOwner !== username) {
      return NextResponse.json({ error: 'Not authorized to respond' }, { status: 403 });
    }
    
    let updateData: any = {};
    let calendarEvents = [];
    
    if (action === 'accept') {
      updateData.status = 'accepted';
      
      // Create calendar events for both users
      const eventData = {
        title: appointment.title,
        description: appointment.description,
        type: 'meeting',
        startDate: appointment.proposedDate,
        startTime: appointment.proposedStartTime,
        endTime: appointment.proposedEndTime,
        color: '#0000FF',
        isAllDay: false
      };
      
      // Event for requester
      const requesterEvent = await CalendarEvent.create({
        ...eventData,
        userId: appointment.requesterId,
        username: appointment.requesterUsername
      });
      
      // Event for requested user
      const requestedEvent = await CalendarEvent.create({
        ...eventData,
        userId: appointment.requestedId,
        username: appointment.requestedUsername
      });
      
      calendarEvents = [requesterEvent, requestedEvent];
      
      updateData.$push = {
        history: {
          action: 'accepted',
          by: username,
          timestamp: new Date(),
          details: { calendarEventIds: [requesterEvent._id, requestedEvent._id] }
        }
      };
    } else if (action === 'decline') {
      updateData.status = 'declined';
      updateData.declineReason = reason;
      updateData.$push = {
        history: {
          action: 'declined',
          by: username,
          timestamp: new Date(),
          details: { reason }
        }
      };
    } else if (action === 'counter-propose') {
      updateData.status = 'pending';
      
      updateData.proposedDate = new Date(counterProposal.date);
      updateData.proposedStartTime = counterProposal.startTime;
      updateData.proposedEndTime = counterProposal.endTime;
      
      updateData.counterProposal = {
        date: new Date(counterProposal.date),
        startTime: counterProposal.startTime,
        endTime: counterProposal.endTime,
        reason: counterProposal.reason
      };
      
      // Swap roles
      const originalRequester = appointment.requesterUsername;
      const originalRequesterId = appointment.requesterId;
      const originalRequested = appointment.requestedUsername;
      const originalRequestedId = appointment.requestedId;
      
      updateData.requesterUsername = originalRequested;
      updateData.requesterId = originalRequestedId;
      updateData.requestedUsername = originalRequester;
      updateData.requestedId = originalRequesterId;
      updateData.currentOwner = originalRequester;
      
      updateData.$push = {
        history: {
          action: 'counter-proposed',
          by: username,
          timestamp: new Date(),
          details: {
            ...counterProposal,
            swappedRoles: true,
            originalRequester: originalRequester,
            newRequester: originalRequested
          }
        }
      };
    }
    
    // Uses primary key index (_id)
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId, 
      updateData, 
      { new: true }
    );
    
    return NextResponse.json({ 
      appointment: updatedAppointment, 
      calendarEvents,
      success: true 
    });
  } catch (error: any) {
    console.error('Appointment respond error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Cancel/delete appointment request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id: appointmentId } = await params;
    
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }
    
    // Uses primary key index (_id)
    const appointment = await Appointment.findById(appointmentId);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Only the requester can delete, and only if it's pending
    if (appointment.requesterUsername !== username) {
      return NextResponse.json({ 
        error: 'Only the requester can delete this appointment' 
      }, { status: 403 });
    }
    
    if (appointment.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Can only delete pending appointments' 
      }, { status: 400 });
    }
    
    // Delete the appointment
    await Appointment.findByIdAndDelete(appointmentId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Appointment request deleted successfully'
    });
  } catch (error: any) {
    console.error('Appointment delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}