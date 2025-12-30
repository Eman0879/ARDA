// ===== app/api/org-announcements/route.ts (PERFORMANCE OPTIMIZED) =====
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import OrgAnnouncement from '@/models/OrgAnnouncement';

export async function GET() {
  try {
    await dbConnect();
    
    const currentDate = new Date();
    
    // OPTIMIZATION 1: Add expiration filter to the query (not in-memory)
    // OPTIMIZATION 2: Only select fields needed for display
    // Uses compound index: { isDeleted: 1, pinned: -1, createdAt: -1 }
    const announcements = await OrgAnnouncement.find({
      isDeleted: { $ne: true },
      // Filter expired announcements in the query
      $or: [
        { expirationDate: null },
        { expirationDate: { $gte: currentDate } }
      ]
    })
    .select('title content author createdAt pinned edited expirationDate borderColor attachments') // Only needed fields
    .sort({ pinned: -1, createdAt: -1 })
    .lean();

    return NextResponse.json({ 
      success: true, 
      announcements 
    });
  } catch (error) {
    console.error('Error fetching org announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch org announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { title, content, author, expirationDate, borderColor, attachments } = body;

    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Title, content, and author are required' },
        { status: 400 }
      );
    }

    let expirationDateTime = null;
    if (expirationDate) {
      const date = new Date(expirationDate);
      date.setHours(17, 0, 0, 0);
      expirationDateTime = date;
    }

    const newAnnouncement = await OrgAnnouncement.create({
      title,
      content,
      author,
      createdAt: new Date(),
      pinned: false,
      edited: false,
      isDeleted: false,
      expirationDate: expirationDateTime,
      borderColor: borderColor || '#FF0000',
      attachments: attachments || []
    });

    return NextResponse.json({ 
      success: true, 
      announcement: newAnnouncement 
    });
  } catch (error) {
    console.error('Error creating org announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create org announcement' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    if (updates.title || updates.content || updates.attachments) {
      updates.edited = true;
    }

    if (updates.expirationDate) {
      const date = new Date(updates.expirationDate);
      date.setHours(17, 0, 0, 0);
      updates.expirationDate = date;
    }

    const updatedAnnouncement = await OrgAnnouncement.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );

    if (!updatedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      announcement: updatedAnnouncement 
    });
  } catch (error) {
    console.error('Error updating org announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update org announcement' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    const deletedAnnouncement = await OrgAnnouncement.findByIdAndUpdate(
      id,
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    if (!deletedAnnouncement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Announcement deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting org announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete org announcement' },
      { status: 500 }
    );
  }
}