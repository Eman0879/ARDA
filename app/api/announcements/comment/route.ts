// ===== app/api/announcements/comment/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Announcement from '@/models/Announcement';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { announcementId, author, text } = body;

    if (!announcementId || !author || !text) {
      return NextResponse.json(
        { error: 'Announcement ID, author, and text are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const newComment = {
      _id: new mongoose.Types.ObjectId(),
      author,
      text,
      pinned: false,
      isDeleted: false,
      createdAt: new Date()
    };

    // Uses primary key index on _id
    const result = await Announcement.findByIdAndUpdate(
      announcementId,
      { 
        $push: { comments: newComment }
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
      comment: newComment
    });

  } catch (error: any) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { announcementId, commentId, pinned, isDeleted } = body;

    if (!announcementId || !commentId) {
      return NextResponse.json(
        { error: 'Announcement ID and comment ID are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateFields: any = {};
    
    if (pinned !== undefined) {
      updateFields['comments.$.pinned'] = pinned;
    }
    if (isDeleted !== undefined) {
      updateFields['comments.$.isDeleted'] = isDeleted;
      if (isDeleted) {
        updateFields['comments.$.deletedAt'] = new Date();
      }
    }

    // Uses primary key index on _id
    const result = await Announcement.updateOne(
      { 
        _id: new mongoose.Types.ObjectId(announcementId),
        'comments._id': new mongoose.Types.ObjectId(commentId)
      },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Announcement or comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const announcementId = searchParams.get('announcementId');
    const commentId = searchParams.get('commentId');

    if (!announcementId || !commentId) {
      return NextResponse.json(
        { error: 'Announcement ID and comment ID are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Soft delete comment by setting isDeleted flag
    const result = await Announcement.updateOne(
      { 
        _id: new mongoose.Types.ObjectId(announcementId),
        'comments._id': new mongoose.Types.ObjectId(commentId)
      },
      { 
        $set: { 
          'comments.$.isDeleted': true,
          'comments.$.deletedAt': new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Announcement or comment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment', details: error.message },
      { status: 500 }
    );
  }
}