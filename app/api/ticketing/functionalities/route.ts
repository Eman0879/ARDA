// ============================================
// UPDATED: app/api/ticketing/functionalities/route.ts
// Only return active functionalities for ticket creation
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Functionality from '@/models/Functionality';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    // Build query - ONLY ACTIVE FUNCTIONALITIES
    const query: any = {
      isActive: true
    };
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort
    const sortOptions: any = {};
    if (search) {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions.createdAt = -1;
    }

    const functionalities = await Functionality.find(query)
      .select('name description department formSchema workflow createdAt isActive')
      .sort(sortOptions)
      .lean();

    // Get unique departments that have ACTIVE functionalities
    const departments = await Functionality.distinct('department', { isActive: true });

    console.log('📋 Fetched active functionalities:', {
      count: functionalities.length,
      departments: departments.length
    });

    return NextResponse.json({
      success: true,
      functionalities,
      departments: departments.sort()
    });
  } catch (error) {
    console.error('Error fetching functionalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch functionalities' },
      { status: 500 }
    );
  }
}