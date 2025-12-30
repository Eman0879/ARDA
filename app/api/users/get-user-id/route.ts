// ===== app/api/users/get-user-id/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        { error: 'Identifier is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up user by identifier:', identifier);

    // Check if identifier is already a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier) && identifier.length === 24) {
      console.log('  ✅ Identifier is already a valid ObjectId');
      
      // Direct _id lookup is the fastest (uses primary key index)
      const user = await FormData.findById(identifier).select('_id username').lean();
      
      if (user) {
        return NextResponse.json({
          success: true,
          userId: identifier,
          username: user.username,
          note: 'Identifier was already an ObjectId'
        });
      } else {
        return NextResponse.json(
          { error: 'User not found with this ObjectId', identifier },
          { status: 404 }
        );
      }
    }

    // Uses unique index on username (case-sensitive, most efficient)
    console.log('  → Trying username search...');
    let user = await FormData.findOne({ username: identifier })
      .select('_id username basicDetails.name')
      .lean();
    
    if (user) {
      console.log('  ✅ Found by username (case-sensitive)!');
    } else {
      // Case-insensitive search (slower, but necessary fallback)
      console.log('  → Trying case-insensitive username search...');
      user = await FormData.findOne({
        username: new RegExp(`^${identifier}$`, 'i')
      })
      .select('_id username basicDetails.name')
      .lean();
      
      if (user) {
        console.log('  ✅ Found by username (case-insensitive)!');
      }
    }

    if (!user) {
      console.log('❌ User not found');
      
      if (process.env.NODE_ENV === 'development') {
        const allUsers = await FormData.find({})
          .select('_id username basicDetails.name')
          .limit(10)
          .lean();
        
        console.log('📋 Sample users in database:', allUsers.map(u => ({
          _id: u._id,
          username: u.username,
          name: u.basicDetails?.name
        })));
      }
      
      return NextResponse.json(
        { 
          error: 'User not found', 
          identifier, 
          hint: 'User with this username does not exist'
        },
        { status: 404 }
      );
    }

    console.log('✅ Found user:', {
      _id: user._id,
      username: user.username,
      name: user.basicDetails?.name
    });

    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      username: user.username,
      name: user.basicDetails?.name
    });
  } catch (error) {
    console.error('❌ Error fetching user ID:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user ID', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}