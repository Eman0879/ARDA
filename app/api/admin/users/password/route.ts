// app/api/admin/users/password/route.ts
// UPDATE THIS FILE TO USE FORMDATAS COLLECTION

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

export async function PATCH(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'Missing userId or newPassword' },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection.db;
    const formdatasCollection = db.collection('formdatas');

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { ObjectId } = require('mongodb');
    const result = await formdatasCollection.updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
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
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    );
  }
}