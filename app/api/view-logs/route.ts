// ===== app/api/view-logs/route.ts =====
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import OrgAnnouncement from '@/models/OrgAnnouncement';
import Announcement from '@/models/Announcement';

export async function POST(request: Request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { type, department, startDate, endDate } = body;

    if (!type || (type !== 'org' && type !== 'dept')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "org" or "dept"' },
        { status: 400 }
      );
    }

    if (type === 'dept' && !department) {
      return NextResponse.json(
        { error: 'Department is required for department logs' },
        { status: 400 }
      );
    }

    let query: any = {};

    // Add date range filter if provided
    // Uses index: { isDeleted: 1, createdAt: -1 } or { isDeleted: 1, department: 1, createdAt: -1 }
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    let announcements;
    
    if (type === 'org') {
      // Uses index: { isDeleted: 1, createdAt: -1 }
      announcements = await OrgAnnouncement.find(query)
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Uses compound index: { isDeleted: 1, department: 1, createdAt: -1 }
      query.department = department;
      announcements = await Announcement.find(query)
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ 
      announcements: announcements || [],
      count: announcements?.length || 0,
      filtered: !!(startDate && endDate)
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}