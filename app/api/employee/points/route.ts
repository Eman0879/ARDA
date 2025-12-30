// app/api/employee/points/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const department = searchParams.get('department');

    console.log('Points API called with:', { employeeId, department });

    if (!employeeId || !department) {
      return NextResponse.json(
        { error: 'Employee ID and department are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection.db;
    const leaderboardCollection = db.collection('leaderboard');

    // Try to find by ObjectId first
    let leaderboardEntry = null;
    
    try {
      leaderboardEntry = await leaderboardCollection.findOne({
        employeeId: new mongoose.Types.ObjectId(employeeId),
        department: department
      });
      console.log('Found by ObjectId:', leaderboardEntry);
    } catch (err) {
      console.log('ObjectId lookup failed, trying string match');
    }

    // If not found by ObjectId, try string comparison
    if (!leaderboardEntry) {
      leaderboardEntry = await leaderboardCollection.findOne({
        employeeId: employeeId,
        department: department
      });
      console.log('Found by string match:', leaderboardEntry);
    }

    // If still not found, try to find by any matching employeeId format
    if (!leaderboardEntry) {
      const allEntries = await leaderboardCollection.find({ department: department }).toArray();
      console.log('All leaderboard entries for department:', allEntries.length);
      
      leaderboardEntry = allEntries.find(entry => {
        const entryId = entry.employeeId?.toString();
        console.log('Comparing:', { entryId, employeeId, match: entryId === employeeId });
        return entryId === employeeId || entryId === employeeId.toString();
      });
      
      console.log('Found by manual search:', leaderboardEntry);
    }

    const points = leaderboardEntry?.points || 0;
    console.log('Returning points:', points);

    return NextResponse.json({
      success: true,
      points: points,
      found: !!leaderboardEntry
    });

  } catch (error) {
    console.error('Error fetching employee points:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee points', details: error.message },
      { status: 500 }
    );
  }
}