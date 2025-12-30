// ===== app/api/dept-employees/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department parameter is required' },
        { status: 400 }
      );
    }

    // Uses compound index: { department: 1, status: 1 }
    const employees = await FormData.find(
      { 
        department, // Indexed field first
        status: 'approved' // Indexed field second
      },
      {
        _id: 1,
        username: 1,
        'basicDetails.name': 1,
        'basicDetails.profileImage': 1,
        title: 1,
        department: 1
      }
    ).sort({ 'basicDetails.name': 1 }); // Uses index: { 'basicDetails.name': 1 }

    return NextResponse.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}
