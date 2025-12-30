// app/api/tickets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Ticket from '@/models/Ticket';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;

    console.log(`🔍 Fetching ticket: ${id}`);

    // Find ticket by ID and populate functionality details
    const ticket = await Ticket.findById(id)
      .populate('functionality')
      .lean();

    if (!ticket) {
      console.log(`❌ Ticket not found: ${id}`);
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Found ticket: ${ticket.ticketNumber}`);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('❌ Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const updates = await request.json();

    console.log(`📝 Updating ticket: ${id}`);

    // Find and update ticket
    const ticket = await Ticket.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!ticket) {
      console.log(`❌ Ticket not found: ${id}`);
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Updated ticket: ${ticket.ticketNumber}`);

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('❌ Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;

    console.log(`🗑️ Deleting ticket: ${id}`);

    // Find and delete ticket
    const ticket = await Ticket.findByIdAndDelete(id).lean();

    if (!ticket) {
      console.log(`❌ Ticket not found: ${id}`);
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Deleted ticket: ${ticket.ticketNumber}`);

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}