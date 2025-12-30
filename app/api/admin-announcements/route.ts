// app/api/admin-announcements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

// Admin Announcement Schema
const AdminAnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  pinned: { type: Boolean, default: false },
  edited: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const AdminAnnouncement = mongoose.models.AdminAnnouncement || 
  mongoose.model('AdminAnnouncement', AdminAnnouncementSchema);

// GET - Fetch all admin announcements
export async function GET() {
  try {
    await dbConnect();
    
    const announcements = await AdminAnnouncement.find()
      .sort({ pinned: -1, createdAt: -1 });
    
    return NextResponse.json({ announcements }, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST - Create new admin announcement
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { title, content, author } = body;
    
    if (!title || !content || !author) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const announcement = await AdminAnnouncement.create({
      title,
      content,
      author
    });
    
    return NextResponse.json({ announcement }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

// PATCH - Update admin announcement
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID required' },
        { status: 400 }
      );
    }
    
    // If updating title or content, mark as edited
    if (updates.title || updates.content) {
      updates.edited = true;
    }
    
    const announcement = await AdminAnnouncement.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ announcement }, { status: 200 });
  } catch (error) {
    console.error('Error updating admin announcement:', error);
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE - Delete admin announcement
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Announcement ID required' },
        { status: 400 }
      );
    }
    
    const announcement = await AdminAnnouncement.findByIdAndDelete(id);
    
    if (!announcement) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Announcement deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting admin announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}