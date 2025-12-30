// app/api/workflows/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

// Define Workflow Schema
const WorkflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

// Get or create Workflow model
const Workflow = mongoose.models.Workflow || mongoose.model('Workflow', WorkflowSchema);

export async function GET() {
  try {
    await dbConnect();

    // Fetch all workflows from database
    const workflows = await Workflow.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      workflows: workflows,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch workflows',
        workflows: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { name, url } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { success: false, message: 'Name and URL are required' },
        { status: 400 }
      );
    }

    // Create new workflow
    const workflow = await Workflow.create({ name, url });

    return NextResponse.json({
      success: true,
      workflow: workflow,
      message: 'Workflow created successfully',
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}