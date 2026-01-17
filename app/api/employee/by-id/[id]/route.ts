// app/api/employee/by-id/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Query by MongoDB _id
    const employee = await FormData.findById(id).select('username _id');

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      username: employee.username,
      userId: employee._id.toString()
    });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch employee data' },
      { status: 500 }
    );
  }
}