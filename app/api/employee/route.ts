// app/api/employee/route.ts
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
    const formdatasCollection = db.collection('formdatas');
    const leaderboardCollection = db.collection('leaderboard');

    // Find all employees in the same department
    const employees = await formdatasCollection
      .find({
        department: department,
        isDeptHead: { $ne: true } // Exclude department heads from the list
      })
      .project({
        _id: 1,
        username: 1,
        displayName: 1,
        department: 1,
        title: 1,
        employeeNumber: 1,
        employeeGroup: 1,
        employeeSubGroup: 1,
        contactInformation: 1,
        basicDetails: 1
      })
      .toArray();

    // Get points for each employee from leaderboard
    const employeesWithPoints = await Promise.all(
      employees.map(async (employee) => {
        const leaderboardEntry = await leaderboardCollection.findOne({
          employeeId: employee._id,
          department
        });

        // Construct display name from basicDetails
        let displayName = employee.username;
        if (employee.basicDetails) {
          const title = employee.basicDetails.title || '';
          const name = employee.basicDetails.name || '';
          displayName = `${title} ${name}`.trim() || employee.username;
        }

        return {
          ...employee,
          displayName,
          points: leaderboardEntry?.points || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      employees: employeesWithPoints,
      count: employeesWithPoints.length
    });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees', details: error.message },
      { status: 500 }
    );
  }
}