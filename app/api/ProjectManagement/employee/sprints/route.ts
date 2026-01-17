// app/api/ProjectManagement/employee/sprints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Sprint from '@/models/ProjectManagement/Sprint';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // This is actually username (email)

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Query by username field in members array
    const sprints = await Sprint.find({
      'members.username': userId,
      'members.leftAt': { $exists: false }
    }).sort({ createdAt: -1 });

    // Calculate user's role and permissions for each sprint
    const sprintsWithRole = sprints.map(sprint => {
      const member = sprint.members.find(m => 
        m.username === userId && !m.leftAt
      );
      const isLead = member?.role === 'lead';
      const isDeptHead = member?.role === 'dept-head';
      
      // For regular employees: show ALL actions (can view all, but only perform actions on assigned ones)
      // For dept heads: show ALL actions (same viewing permissions)
      const allActions = sprint.actions || [];
      
      // Get actions assigned to this user (check by userId from member object)
      const myActions = allActions.filter(a => 
        a.assignedTo.some((assignedId: string) => assignedId === member?.userId)
      );

      const pendingActions = myActions.filter(a => a.status !== 'done');

      // Calculate days remaining
      const now = new Date();
      const endDate = new Date(sprint.endDate);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...sprint.toObject(),
        myRole: member?.role || 'member',
        isLead,
        isDeptHead,
        myActions: myActions.length,
        myPendingActions: pendingActions.length,
        daysRemaining,
        myUserId: member?.userId, // Pass the ObjectId for action checking
        myUsername: userId, // Pass username for reference
        // Include ALL actions so employees can see the full sprint scope
        actions: allActions
      };
    });

    return NextResponse.json({
      success: true,
      sprints: sprintsWithRole
    });
  } catch (error) {
    console.error('Error fetching employee sprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}