// ===== NEW: app/api/calendar/search/route.ts =====
// Optional search endpoint to leverage text index
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import CalendarEvent from '@/models/CalendarEvent';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const searchTerm = searchParams.get('q');
    
    if (!userId || !searchTerm) {
      return NextResponse.json({ 
        error: 'userId and search term (q) are required' 
      }, { status: 400 });
    }
    
    // Uses text index: { title: 'text', description: 'text' }
    const events = await CalendarEvent.find({
      userId,
      $text: { $search: searchTerm }
    })
    .sort({ score: { $meta: 'textScore' } })
    .lean();
    
    return NextResponse.json({ events, success: true });
  } catch (error: any) {
    console.error('Calendar search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}