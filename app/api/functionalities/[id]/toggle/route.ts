// ============================================
// NEW: app/api/functionalities/[id]/toggle/route.ts
// Toggle isActive status for functionality
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Functionality from '@/models/Functionality';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    // Find the functionality
    const functionality = await Functionality.findById(id);
    
    if (!functionality) {
      return NextResponse.json(
        { error: 'Functionality not found' },
        { status: 404 }
      );
    }

    // Toggle the isActive status
    functionality.isActive = !functionality.isActive;
    await functionality.save();

    console.log('🔄 Toggled functionality status:', {
      id: functionality._id,
      name: functionality.name,
      isActive: functionality.isActive
    });

    return NextResponse.json({
      success: true,
      isActive: functionality.isActive,
      message: `Functionality ${functionality.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('❌ Error toggling functionality:', error);
    return NextResponse.json(
      { error: 'Failed to toggle functionality status' },
      { status: 500 }
    );
  }
}