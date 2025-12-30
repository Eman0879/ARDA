// ===== app/api/employee/[username]/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await dbConnect();

    const { username } = await params;

    // Uses unique index on username (automatically created)
    const employee = await FormData.findOne({ username }).select('-password');

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      employee: employee,
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employee data' },
      { status: 500 }
    );
  }
}