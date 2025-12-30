// app/api/admin/users/approval/route.ts
// UPDATE THIS FILE TO USE FORMDATAS COLLECTION

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, isApproved } = await request.json();

    if (!userId || isApproved === undefined) {
      return NextResponse.json(
        { error: 'Missing userId or isApproved' },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection.db;
    const formdatasCollection = db.collection('formdatas');

    const { ObjectId } = require('mongodb');
    const result = await formdatasCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          isApproved: isApproved,
          status: isApproved ? 'approved' : 'pending',
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Approval status updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating approval status:', error);
    return NextResponse.json(
      { error: 'Failed to update approval status' },
      { status: 500 }
    );
  }
}