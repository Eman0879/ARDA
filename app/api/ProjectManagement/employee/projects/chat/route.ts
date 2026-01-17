// app/api/ProjectManagement/employee/projects/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Project from '@/models/ProjectManagement/Project';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { projectId, userId, userName, message } = body;

    if (!projectId || !userId || !userName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify user is a member - check by username field (userId param is actually username)
    const isMember = project.members.some((m: any) => 
      m.username === userId && !m.leftAt
    );

    if (!isMember) {
      console.log(`User ${userId} (${userName}) is not a member of project ${projectId}`);
      console.log('Project members:', project.members.map((m: any) => ({ username: m.username, name: m.name, leftAt: m.leftAt })));
      return NextResponse.json(
        { error: 'You are not a member of this project' },
        { status: 403 }
      );
    }

    // Add message to chat
    project.chat.push({
      userId,
      userName,
      message,
      timestamp: new Date(),
      attachments: []
    });

    await project.save();

    return NextResponse.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Error sending project chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}