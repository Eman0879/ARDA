// app/api/ProjectManagement/depthead/sprints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Sprint from '@/models/ProjectManagement/Sprint';
import FormData from '@/models/FormData';
import { sendSprintNotification } from '@/app/utils/projectNotifications';
import { TimeIntent } from '@/models/CalendarEvent';
import { saveAttachment } from '@/app/utils/projectFileUpload';

// Helper function to create calendar event
async function createCalendarEvent(eventData: any) {
  try {
    const event = new TimeIntent({
      userId: eventData.userId,
      type: eventData.type,
      title: eventData.title,
      description: eventData.description,
      startTime: eventData.startTime ? new Date(eventData.startTime) : undefined,
      endTime: eventData.endTime ? new Date(eventData.endTime) : undefined,
      priority: eventData.priority || 'medium',
      color: eventData.color || '#2196F3',
      linkedSprintId: eventData.linkedSprintId,
      autoCompleteOnExpiry: eventData.autoCompleteOnExpiry || false,
      isSystemGenerated: true,
      createdBy: {
        userId: 'system',
        name: 'System'
      }
    });
    await event.save();
    return { success: true, eventId: event._id.toString() };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return { success: false, error: String(error) };
  }
}

// GET - Fetch all sprints for department head
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const username = searchParams.get('username');
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department parameter is required' },
        { status: 400 }
      );
    }

    const query: any = {
      $or: [
        { department },
        { 'members.username': username, 'members.role': 'dept-head' }
      ]
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const sprints = await Sprint.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      sprints
    });
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sprints' },
      { status: 500 }
    );
  }
}

// POST - Create new sprint
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { 
      title, 
      description, 
      department,
      projectId,
      projectNumber,
      createdBy, 
      createdByName,
      members,
      groupLead,
      startDate,
      endDate,
      defaultAction,
      attachments
    } = body;

    console.log('📥 Received sprint creation request:', {
      title,
      department,
      memberCount: members?.length,
      attachmentCount: attachments?.length
    });

    if (!title || !description || !department || !createdBy || !members || !groupLead || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate sprint number
    const lastSprint = await Sprint.findOne({ department })
      .sort({ createdAt: -1 });
    
    let sprintNumber;
    if (lastSprint && lastSprint.sprintNumber) {
      const lastNum = parseInt(lastSprint.sprintNumber.split('-')[1]);
      sprintNumber = `SPR-${String(lastNum + 1).padStart(4, '0')}`;
    } else {
      sprintNumber = 'SPR-0001';
    }

    console.log(`🔢 Generated sprint number: ${sprintNumber}`);

    // Fetch usernames for all members
    const memberUserIds = members.map((m: any) => m.userId);
    const employeeRecords = await FormData.find({ _id: { $in: memberUserIds } })
      .select('_id username');
    
    const userIdToUsername = new Map();
    employeeRecords.forEach((emp: any) => {
      userIdToUsername.set(emp._id.toString(), emp.username);
    });

    // Enrich members with username
    const enrichedMembers = members.map((m: any) => ({
      userId: m.userId,
      username: userIdToUsername.get(m.userId) || m.userId,
      name: m.name,
      role: m.role,
      department: m.department,
      joinedAt: new Date()
    }));

    // Create default action if provided - FIXED: Changed 'todo' to 'pending'
    const actions = defaultAction ? [{
      title: defaultAction.title,
      description: defaultAction.description,
      assignedTo: [groupLead],
      status: 'pending', // FIXED: Changed from 'todo' to 'pending'
      priority: 'medium',
      attachments: [],
      blockers: [],
      comments: [],
      history: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }] : [];

    console.log('✅ Created default action with status: pending');

    const sprint = new Sprint({
      sprintNumber,
      title,
      description,
      department,
      projectId: projectId || null,
      projectNumber: projectNumber || null,
      createdBy,
      createdByName,
      members: enrichedMembers,
      groupLead,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'active',
      actions,
      chat: [],
      attachments: []
    });

    // Save sprint first to get the ID
    console.log('💾 Saving sprint to database...');
    await sprint.save();
    console.log(`✅ Sprint saved with ID: ${sprint._id}`);

    // Handle attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      console.log(`📎 Processing ${attachments.length} attachments for sprint ${sprintNumber}`);
      
      const savedAttachments = [];
      
      for (const attachment of attachments) {
        try {
          console.log(`📄 Processing attachment: ${attachment.name} (${attachment.type}, ${attachment.size} bytes)`);
          
          const savedPath = saveAttachment(sprintNumber, {
            name: attachment.name,
            data: attachment.data,
            type: attachment.type
          });
          
          savedAttachments.push({
            name: attachment.name,
            path: savedPath,
            type: attachment.type,
            size: attachment.size,
            uploadedAt: new Date(),
            uploadedBy: {
              userId: createdBy,
              name: createdByName
            }
          });
          
          console.log(`✅ Saved attachment: ${attachment.name} to ${savedPath}`);
        } catch (attError) {
          console.error(`❌ Failed to save attachment ${attachment.name}:`, attError);
        }
      }
      
      // Update sprint with saved attachments
      if (savedAttachments.length > 0) {
        sprint.attachments = savedAttachments;
        await sprint.save();
        console.log(`✅ Updated sprint with ${savedAttachments.length} attachments`);
        console.log('📋 Attachment details:', savedAttachments.map(a => ({ name: a.name, path: a.path })));
      }
    } else {
      console.log('ℹ️ No attachments to process');
    }

    // Get dept head's userId
    const deptHeadUser = await FormData.findOne({ username: createdBy }).select('_id');
    const deptHeadUserId = deptHeadUser ? deptHeadUser._id.toString() : null;
    
    const allUserIdsWithHead = deptHeadUserId 
      ? [...new Set([...memberUserIds, deptHeadUserId])]
      : [...new Set(memberUserIds)];

    console.log(`📅 Creating calendar events for ${allUserIdsWithHead.length} users`);

    // Create calendar events for all involved users
    const calendarSyncPromises = allUserIdsWithHead.map(async (userId: string) => {
      try {
        // Create sprint start event
        await createCalendarEvent({
          userId: userId,
          type: 'reminder',
          title: `Sprint Start: ${title}`,
          description: `${sprintNumber} - ${description}`,
          startTime: new Date(startDate),
          endTime: new Date(startDate),
          priority: 'medium',
          linkedSprintId: sprint._id.toString(),
          color: '#9C27B0'
        });

        // Create sprint end event
        await createCalendarEvent({
          userId: userId,
          type: 'deadline',
          title: `Sprint End: ${title}`,
          description: `${sprintNumber} - ${description}`,
          startTime: new Date(endDate),
          endTime: new Date(endDate),
          priority: 'high',
          linkedSprintId: sprint._id.toString(),
          color: '#E91E63'
        });
      } catch (err) {
        console.error(`Calendar sync error for user ${userId}:`, err);
      }
    });

    await Promise.allSettled(calendarSyncPromises);
    console.log('✅ Calendar events created');

    // Send notifications
    try {
      await sendSprintNotification(
        sprint,
        'created',
        createdBy,
        createdByName
      );
      console.log('✅ Notifications sent');
    } catch (notifError) {
      console.error('Failed to send sprint notification:', notifError);
    }

    console.log('🎉 Sprint creation completed successfully');

    return NextResponse.json({
      success: true,
      sprint: {
        ...sprint.toObject(),
        _id: sprint._id.toString()
      }
    });
  } catch (error) {
    console.error('❌ Error creating sprint:', error);
    return NextResponse.json(
      { error: 'Failed to create sprint', details: String(error) },
      { status: 500 }
    );
  }
}