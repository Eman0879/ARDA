// app/api/admin/departments/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

const FormDataSchema = new mongoose.Schema({
  department: String
}, { collection: 'formdatas' });

const FormData = mongoose.models.FormData || mongoose.model('FormData', FormDataSchema);

export async function GET() {
  try {
    await dbConnect();
    
    // Get unique departments
    const departments = await FormData.distinct('department');
    
    // Filter out null/undefined and sort
    const validDepartments = departments
      .filter(dept => dept && dept.trim() !== '')
      .sort();
    
    return NextResponse.json({ departments: validDepartments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}