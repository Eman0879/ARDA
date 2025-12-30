// ===== app/api/team-members/route.ts =====
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    
    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department parameter is required' },
        { status: 400 }
      );
    }
    
    // Uses compound index: { department: 1, status: 1 }
    const users = await FormData.find(
      { 
        department, // Indexed field first
        status: 'approved' // Indexed field second
      },
      { 
        username: 1, 
        title: 1,
        'basicDetails.name': 1,
        'contactInformation.email': 1,
        _id: 0 
      }
    )
    .sort({ 'basicDetails.name': 1 }) // Uses index: { 'basicDetails.name': 1 }
    .lean();
    
    // Transform the data to the expected format
    const members = users.map(user => ({
      username: user.username,
      displayName: user.basicDetails?.name || user.username,
      email: user.contactInformation?.email || `${user.username}@company.com`,
      role: 'employee'
    })).filter(member => member.username && member.displayName && member.email);
    
    console.log('Fetched team members:', members);
    
    return NextResponse.json({ 
      success: true, 
      data: members 
    });
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}