// ===== app/api/ticketing/functionalities/route.ts =====
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Functionality from '@/models/Functionality';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build query
    const query: any = {};
    
    if (search) {
      // Uses text index: { name: 'text', description: 'text' }
      query.$text = { $search: search };
    }
    
    if (department) {
      query.department = department;
    }

    // Build sort
    const sortOptions: any = {};
    if (search) {
      // Sort by text relevance when searching
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions[sortBy] = order === 'asc' ? 1 : -1;
    }

    // Uses appropriate indexes:
    // - Text index if searching
    // - { department: 1, createdAt: -1 } if filtering by department
    const functionalities = await Functionality.find(query)
      .select('name description department formSchema workflow createdAt')
      .sort(sortOptions)
      .lean();

    // Get unique departments - uses index on department
    const departments = await Functionality.distinct('department');

    return NextResponse.json({
      success: true,
      functionalities,
      departments
    });
  } catch (error) {
    console.error('Error fetching functionalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch functionalities' },
      { status: 500 }
    );
  }
}
