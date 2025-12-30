// ===== app/api/projects/route.js =====
import dbConnect from '@/lib/mongoose';
import Project from '@/models/Project';
import Task from '@/models/Task';
import { NextResponse } from 'next/server';

// GET - Fetch all projects (with optional department filter)
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    
    console.log('📊 Fetching projects with filters:', { department, status });
    
    // Build query
    const query = {};
    
    if (department) {
      query.department = department;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Fetch projects
    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`📊 Found ${projects.length} projects`);
    
    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await Task.aggregate([
          { $match: { projectId: project._id } },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);
        
        const counts = {
          total: 0,
          todo: 0,
          'in-progress': 0,
          review: 0,
          blocked: 0,
          completed: 0
        };
        
        taskCounts.forEach(item => {
          counts[item._id] = item.count;
          counts.total += item.count;
        });
        
        return {
          ...project,
          taskCounts: counts
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      data: projectsWithCounts,
      count: projectsWithCounts.length
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
    
    const project = await Project.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
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