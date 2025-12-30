// app/api/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');

    if (!department) {
      return NextResponse.json(
        { error: 'Department parameter is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection.db;
    const leaderboardCollection = db.collection('leaderboard');

    // Get leaderboard entries sorted by points
    const leaderboard = await leaderboardCollection
      .find({ department })
      .sort({ points: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, department, pointsChange } = body;

    if (!employeeId || !department || pointsChange === undefined) {
      return NextResponse.json(
        { error: 'Employee ID, department, and points change are required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const db = mongoose.connection.db;
    const leaderboardCollection = db.collection('leaderboard');
    const formdatasCollection = db.collection('formdatas');

    // Get employee details
    const employee = await formdatasCollection.findOne({
      _id: new mongoose.Types.ObjectId(employeeId)
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Construct display name from basicDetails
    let displayName = employee.username;
    if (employee.basicDetails) {
      const title = employee.basicDetails.title || '';
      const name = employee.basicDetails.name || '';
      displayName = `${title} ${name}`.trim() || employee.username;
    }

    // Get employee number
    const employeeNumber = employee.employeeNumber || employee.username;

    // Check if employee already has a leaderboard entry
    const existingEntry = await leaderboardCollection.findOne({
      employeeId: new mongoose.Types.ObjectId(employeeId),
      department
    });

    if (existingEntry) {
      // Update existing entry
      const newPoints = Math.max(0, (existingEntry.points || 0) + pointsChange);
      
      await leaderboardCollection.updateOne(
        { _id: existingEntry._id },
        {
          $set: {
            points: newPoints,
            displayName: displayName,
            employeeNumber: employeeNumber,
            updatedAt: new Date()
          }
        }
      );

      return NextResponse.json({
        success: true,
        points: newPoints
      });
    } else {
      // Create new entry
      const newPoints = Math.max(0, pointsChange);
      
      const newEntry = {
        employeeId: new mongoose.Types.ObjectId(employeeId),
        department,
        displayName: displayName,
        employeeNumber: employeeNumber,
        points: newPoints,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await leaderboardCollection.insertOne(newEntry);

      return NextResponse.json({
        success: true,
        points: newPoints
      });
    }

  } catch (error) {
    console.error('Error updating leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to update leaderboard', details: error.message },
      { status: 500 }
    );
  }
}