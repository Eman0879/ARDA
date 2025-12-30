// ===== app/api/appointments/users/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import FormData from '@/models/FormData';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const currentUsername = searchParams.get('currentUsername');
    
    // Build query - uses compound index: { department: 1, status: 1 }
    const query: any = {
      status: 'approved', // Indexed field first
      username: { $ne: currentUsername }
    };
    
    let users;
    
    // If search term provided, use text index for efficient searching
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      
      // Use text search index for name, father name, and email
      query.$text = { $search: searchTerm };
      
      users = await FormData.find(query)
        .select('username basicDetails.name department title employeeNumber contactInformation.email')
        .limit(100)
        .sort({ score: { $meta: 'textScore' } }); // Sort by text relevance
    } else {
      // No search - just get approved users sorted by name
      users = await FormData.find(query)
        .select('username basicDetails.name department title employeeNumber contactInformation.email')
        .limit(100)
        .sort({ 'basicDetails.name': 1 }); // Uses index: { 'basicDetails.name': 1 }
    }
    
    console.log(`Found ${users.length} users for search "${search}"`);
    
    return NextResponse.json({ 
      users: users.map(user => ({
        username: user.username,
        displayName: user.basicDetails?.name || user.username,
        department: user.department || 'No Department',
        title: user.title || 'No Title',
        employeeId: user.employeeNumber || user.username,
        email: user.contactInformation?.email || ''
      })), 
      success: true,
      count: users.length
    });
  } catch (error: any) {
    console.error('Users GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}