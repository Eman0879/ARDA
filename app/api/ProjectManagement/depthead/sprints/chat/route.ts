// app/api/ProjectManagement/depthead/sprints/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Sprint from '@/models/ProjectManagement/Sprint';
import { saveAttachment } from '@/app/utils/projectFileUpload';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { sprintId, userId, userName, message, attachments } = body;

    if (!sprintId || !userId || !userName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const sprint = await Sprint.findById(sprintId);
    if (!sprint) {
      return NextResponse.json(
        { error: 'Sprint not found' },
        { status: 404 }
      );
    }

    // Handle attachments if provided
    const savedAttachments: string[] = [];
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      console.log(`📎 Processing ${attachments.length} chat attachments for sprint ${sprint.sprintNumber}`);
      
      for (const attachment of attachments) {
        try {
          const savedPath = saveAttachment(sprint.sprintNumber, {
            name: attachment.name,
            data: attachment.data,
            type: attachment.type
          });
          
          savedAttachments.push(savedPath);
          console.log(`✅ Saved chat attachment: ${attachment.name}`);
        } catch (attError) {
          console.error(`❌ Failed to save chat attachment ${attachment.name}:`, attError);
        }
      }
    }

    // Add message to chat
    sprint.chat.push({
      userId,
      userName,
      message,
      timestamp: new Date(),
      attachments: savedAttachments
    });

    await sprint.save();

    return NextResponse.json({
      success: true,
      sprint
    });
  } catch (error) {
    console.error('Error sending sprint chat message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}