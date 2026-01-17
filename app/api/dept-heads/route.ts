// app/api/dept-heads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Fetch all department heads
    const departmentHeads = await FormData.find({ 
      role: 'depthead' 
    })
      .select('_id basicDetails.name username department')
      .sort({ department: 1 })
      .lean();

    console.log(`📋 Fetched ${departmentHeads.length} department heads`);

    // Transform the data
    const transformedHeads = departmentHeads.map(head => ({
      userId: head._id.toString(),
      username: head.username,
      name: head['basicDetails']?.name || head.username,
      department: head.department
    }));

    return NextResponse.json({
      success: true,
      departmentHeads: transformedHeads
    });
  } catch (error) {
    console.error('❌ Error fetching department heads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department heads' },
      { status: 500 }
    );
  }
}