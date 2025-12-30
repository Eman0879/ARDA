// ===== app/api/departments/route.ts =====
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET() {
  try {
    await dbConnect();
    
    // Uses index: { department: 1, status: 1 }
    // distinct() is optimized when the field is indexed
    const departments = await FormData.distinct('department', { status: 'approved' });
    
    // Filter out null/undefined and sort alphabetically
    const validDepartments = departments
      .filter(dept => dept && dept.trim() !== '')
      .sort();

    return NextResponse.json({ 
      departments: validDepartments,
      count: validDepartments.length 
    });

  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}
