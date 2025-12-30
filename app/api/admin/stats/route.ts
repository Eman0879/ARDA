// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

const FormDataSchema = new mongoose.Schema({
  username: String,
  department: String,
  status: String
}, { collection: 'formdatas' });

const FormData = mongoose.models.FormData || mongoose.model('FormData', FormDataSchema);

export async function GET() {
  try {
    await dbConnect();
    
    // Get total users
    const totalUsers = await FormData.countDocuments();
    
    // Get unique departments
    const departments = await FormData.distinct('department');
    const totalDepartments = departments.filter(dept => dept && dept.trim() !== '').length;
    
    // Get pending approvals - status is 'pending' not 'unapproved'
    const pendingApprovals = await FormData.countDocuments({ 
      $or: [
        { status: 'pending' },
        { status: { $exists: false } },
        { status: '' }
      ]
    });
    
    return NextResponse.json({
      totalUsers,
      totalDepartments,
      pendingApprovals
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}