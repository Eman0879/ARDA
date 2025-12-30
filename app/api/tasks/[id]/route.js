// ===== app/api/tasks/[id]/route.js =====
import dbConnect from '@/lib/mongoose';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';
import { updateCalendarEventsForItem, deleteCalendarEventsForItem } from '@/app/utils/calendarSync';

// GET - Fetch single task
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Uses primary key index (_id)
    const task = await Task.findById(id)
      .populate('projectId', 'name status')
      .lean();
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: task 
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update task
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
    const task = await Task.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    )
    .populate('projectId', 'name status')
    .lean();
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Update calendar events
    if (task.assignees && task.assignees.length > 0) {
      try {
        await updateCalendarEventsForItem(id, 'task', {
          title: task.title,
          description: task.description,
          type: 'task',
          startDate: task.startDate || undefined,
          dueDate: task.dueDate,
          assignees: task.assignees,
          createdBy: task.createdBy
        });
        console.log(`✓ Calendar events updated for task: ${task.title}`);
      } catch (calError) {
        console.error('Error updating calendar events:', calError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: task 
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove task
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Uses primary key index (_id)
    const task = await Task.findByIdAndDelete(id);
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Delete calendar events
    try {
      await deleteCalendarEventsForItem(id, 'task');
      console.log(`✓ Calendar events deleted for task: ${task.title}`);
    } catch (calError) {
      console.error('Error deleting calendar events:', calError);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}