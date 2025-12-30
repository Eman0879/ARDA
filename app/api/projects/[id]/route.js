// ===== app/api/projects/route.js =====
import dbConnect from '@/lib/mongoose';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';
import { createCalendarEventsWithTracking } from '@/app/utils/calendarSync';

// GET - Fetch projects with department isolation
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    
    if (!department) {
      return NextResponse.json(
        { success: false, error: 'Department parameter is required' },
        { status: 400 }
      );
    }
    
    // Build query with department isolation
    const query = { department };
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Uses compound index: { department: 1, status: 1, priority: 1 }
    // or { department: 1, status: 1 }
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Get task counts for each project using aggregation (more efficient)
    const projectIds = projects.map(p => p._id);
    
    // Uses index: { projectId: 1, status: 1, priority: -1 }
    const taskCountsMap = await Task.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { 
        $group: { 
          _id: { projectId: '$projectId', status: '$status' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Build counts map
    const countsById = {};
    taskCountsMap.forEach(item => {
      const pid = item._id.projectId.toString();
      if (!countsById[pid]) {
        countsById[pid] = {
          total: 0,
          todo: 0,
          'in-progress': 0,
          review: 0,
          blocked: 0,
          completed: 0
        };
      }
      countsById[pid][item._id.status] = item.count;
      countsById[pid].total += item.count;
    });
    
    // Attach counts to projects
    const projectsWithCounts = projects.map(project => ({
      ...project,
      taskCounts: countsById[project._id.toString()] || {
        total: 0,
        todo: 0,
        'in-progress': 0,
        review: 0,
        blocked: 0,
        completed: 0
      }
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: projectsWithCounts 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.department) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Projects can have empty assignees
    if (!body.assignees) {
      body.assignees = [];
    }
    
    // Ensure color is set
    if (!body.color) {
      body.color = '#4ECDC4';
    }
    
    console.log('📝 Creating project with body:', {
      name: body.name,
      color: body.color,
      targetDate: body.targetDate,
      startDate: body.startDate
    });
    
    const project = await Project.create(body);
    
    console.log('📊 Project created with dates:', {
      name: project.name,
      startDate: project.startDate,
      targetDate: project.targetDate,
      color: project.color
    });
    
    // Create calendar events for assignees
    if (project.assignees && project.assignees.length > 0) {
      try {
        const projectDueDate = project.targetDate || null;
        const projectStartDate = project.startDate || null;
        const projectColor = project.color || null;
        
        console.log('📅 Calendar sync - dates determined:', {
          projectDueDate,
          projectStartDate,
          projectColor,
          willCreateEvents: !!projectDueDate
        });
        
        if (projectDueDate) {
          await createCalendarEventsWithTracking(project._id.toString(), {
            title: project.name,
            description: project.description,
            type: 'project',
            startDate: projectStartDate || undefined,
            dueDate: projectDueDate,
            assignees: project.assignees,
            createdBy: project.createdBy,
            customColor: projectColor || undefined
          });
          console.log(`✓ Calendar events created for project: ${project.name}`);
        } else {
          console.log(`⚠ Skipped calendar events for project ${project.name} - no due date set`);
        }
      } catch (calError) {
        console.error('Error creating calendar events:', calError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: project 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}