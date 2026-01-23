// app/api/ProjectManagement/employee/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Project from '@/models/ProjectManagement/Project';

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
    const projects = await Project.find({
      'members.username': userId,
      'members.leftAt': { $exists: false }
    }).sort({ createdAt: -1 });

    // Calculate user's role and permissions for each project
    const projectsWithRole = projects
      .filter(project => project.members && Array.isArray(project.members)) // Add this safety check
      .map(project => {
        const member = project.members.find(m => 
          m.username === userId && !m.leftAt
        );
        const isLead = member?.role === 'lead';
        const isDeptHead = member?.role === 'dept-head';
        
        // For regular employees: show ALL deliverables (can view all, but only perform actions on assigned ones)
        // For dept heads: show ALL deliverables (same viewing permissions)
        const allDeliverables = project.deliverables || [];
        
        // Get deliverables assigned to this user (check by userId from member object)
        const myDeliverables = allDeliverables.filter(d => 
          d.assignedTo && d.assignedTo.some((assignedId: string) => assignedId === member?.userId)
        );

        const pendingDeliverables = myDeliverables.filter(d => d.status !== 'done');

        return {
          ...project.toObject(),
          myRole: member?.role || 'member',
          isLead,
          isDeptHead,
          myDeliverables: myDeliverables.length,
          myPendingDeliverables: pendingDeliverables.length,
          myUserId: member?.userId, // Pass the ObjectId for action checking
          myUsername: userId, // Pass username for reference
          // Include ALL deliverables so employees can see the full project scope
          deliverables: allDeliverables
        };
      });

    return NextResponse.json({
      success: true,
      projects: projectsWithRole
    });
  } catch (error) {
    console.error('Error fetching employee projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}