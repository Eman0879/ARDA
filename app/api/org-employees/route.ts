// ============================================
// app/api/org-employees/route.ts
// Fetch all employees across the organization
// UPDATED: Added email field to response
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = {};
    
    if (department) {
      query.department = department;
    }
    
    if (search) {
      query.$or = [
        { 'basicDetails.name': { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch employees with email
    const employeesRaw = await FormData.find(query)
      .select('_id basicDetails.name username title department basicDetails.profileImage contactInformation.email')
      .sort({ 'basicDetails.name': 1 })
      .lean();

    // Transform to include 'name' field at top level
    const employees = employeesRaw.map(emp => ({
      _id: emp._id,
      name: emp.basicDetails?.name || emp.username,
      username: emp.username,
      title: emp.title,
      department: emp.department,
      profileImage: emp.basicDetails?.profileImage,
      contactInformation: emp.contactInformation, // ✅ Include email
      'basicDetails.name': emp.basicDetails?.name || emp.username
    }));

    console.log(`📋 Fetched ${employees.length} employees from organization`);

    return NextResponse.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('❌ Error fetching organization employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}