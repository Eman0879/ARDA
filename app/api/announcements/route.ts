// ===== app/api/announcements/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Announcement from '@/models/Announcement';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');

    if (!department) {
      return NextResponse.json(
        { error: 'Department parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const now = new Date();

    // Uses compound index: { isDeleted: 1, department: 1, createdAt: -1 }
    // and { isDeleted: 1, pinned: -1, urgent: -1, createdAt: -1 }
    const allAnnouncements = await Announcement.find({
      department,
      isDeleted: { $ne: true } // Filter out deleted announcements
    })
    .sort({ pinned: -1, urgent: -1, createdAt: -1 })
    .lean();

    // Filter out expired announcements in-memory (more efficient than adding to query)
    const activeAnnouncements = allAnnouncements.filter(announcement => {
      if (!announcement.expirationDate) return true;
      
      const expirationDate = new Date(announcement.expirationDate);
      return now < expirationDate;
    });

    return NextResponse.json({
      success: true,
      announcements: activeAnnouncements
    });

  } catch (error: any) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📥 Received POST body:', JSON.stringify(body, null, 2));
    
    const { department, title, content, color, expirationDate, attachments } = body;

    if (!department || !title || !content) {
      console.error('❌ Validation failed:', { department, title, content });
      return NextResponse.json(
        { error: 'Department, title, and content are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    let expirationDateTime = null;
    if (expirationDate) {
      const date = new Date(expirationDate);
      date.setHours(17, 0, 0, 0);
      expirationDateTime = date;
    }

    const announcementData = {
      department,
      title,
      content,
      color: color || '#0000FF', // Use "color" to match old API
      expirationDate: expirationDateTime,
      attachments: attachments || [],
    };

    console.log('📝 Creating announcement with data:', JSON.stringify(announcementData, null, 2));

    const newAnnouncement = await Announcement.create(announcementData);

    console.log('✅ Announcement created successfully:', newAnnouncement._id);

    return NextResponse.json({
      success: true,
      announcement: newAnnouncement
    });

  } catch (error: any) {
    console.error('❌ Error creating announcement:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create announcement', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, content, pinned, urgent, expirationDate, isDeleted, attachments } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateFields: any = {};

    if (title !== undefined) {
      updateFields.title = title;
      updateFields.edited = true;
    }
    if (content !== undefined) {
      updateFields.content = content;
      updateFields.edited = true;
    }
    if (attachments !== undefined) {
      updateFields.attachments = attachments;
      updateFields.edited = true;
    }
    if (pinned !== undefined) {
      updateFields.pinned = pinned;
    }
    if (urgent !== undefined) {
      updateFields.urgent = urgent;
      if (urgent) {
        updateFields.pinned = true;
      }
    }
    if (isDeleted !== undefined) {
      updateFields.isDeleted = isDeleted;
      if (isDeleted) {
        updateFields.deletedAt = new Date();
      }
    }
    if (expirationDate !== undefined) {
      if (expirationDate) {
        const date = new Date(expirationDate);
        date.setHours(17, 0, 0, 0);
        updateFields.expirationDate = date;
      } else {
        updateFields.expirationDate = null;
      }
    }

    const result = await Announcement.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement: result
    });

  } catch (error: any) {
    console.error('Error updating announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Soft delete by setting isDeleted flag
    const result = await Announcement.findByIdAndUpdate(
      id,
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement', details: error.message },
      { status: 500 }
    );
  }
}
