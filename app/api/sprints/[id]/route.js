// ===== app/api/sprints/[id]/route.js =====
import dbConnect from '@/lib/mongoose';
import Sprint from '@/models/Sprint';
import { NextResponse } from 'next/server';
import { updateCalendarEventsForItem, deleteCalendarEventsForItem } from '@/app/utils/calendarSync';

// GET - Fetch single sprint
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Uses primary key index (_id)
    const sprint = await Sprint.findById(id).lean();
    
    if (!sprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: sprint 
    });
  } catch (error) {
    console.error('Error fetching sprint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update sprint
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id } = await params;
    
    // Auto-set completedAt when status changes to completed
    if (body.status === 'completed' && !body.completedAt) {
      body.completedAt = new Date();
    }
    
    // Reset completedAt if status changes from completed
    if (body.status && body.status !== 'completed') {
      body.completedAt = null;
    }
    
    body.updatedAt = new Date();
    
    // Uses primary key index (_id)
    const sprint = await Sprint.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!sprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint not found' },
        { status: 404 }
      );
    }
    
    // Update calendar events
    if (sprint.assignees && sprint.assignees.length > 0) {
      try {
        await updateCalendarEventsForItem(id, 'sprint', {
          title: sprint.title,
          description: sprint.description,
          type: 'sprint',
          startDate: sprint.startDate || undefined,
          dueDate: sprint.dueDate,
          assignees: sprint.assignees,
          createdBy: sprint.createdBy
        });
        console.log(`✓ Calendar events updated for sprint: ${sprint.title}`);
      } catch (calError) {
        console.error('Error updating calendar events:', calError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: sprint 
    });
  } catch (error) {
    console.error('Error updating sprint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove sprint
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Uses primary key index (_id)
    const sprint = await Sprint.findByIdAndDelete(id);
    
    if (!sprint) {
      return NextResponse.json(
        { success: false, error: 'Sprint not found' },
        { status: 404 }
      );
    }
    
    // Delete calendar events
    try {
      await deleteCalendarEventsForItem(id, 'sprint');
      console.log(`✓ Calendar events deleted for sprint: ${sprint.title}`);
    } catch (calError) {
      console.error('Error deleting calendar events:', calError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sprint deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting sprint:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}