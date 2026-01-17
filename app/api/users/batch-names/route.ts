// app/api/users/batch-names/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const { userIds } = await request.json();

    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json(
        { error: 'userIds array is required' },
        { status: 400 }
      );
    }

    // Fetch all users by their _id
    const users = await FormData.find(
      { _id: { $in: userIds } },
      { _id: 1, 'basicDetails.name': 1, username: 1 }
    ).lean();

    // Create a map of userId to name
    const userMap: Record<string, string> = {};
    users.forEach((user: any) => {
      userMap[user._id.toString()] = user.basicDetails?.name || user.username || 'Unknown';
    });

    return NextResponse.json({ userMap });
  } catch (error) {
    console.error('Error fetching batch user names:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user names' },
      { status: 500 }
    );
  }
}