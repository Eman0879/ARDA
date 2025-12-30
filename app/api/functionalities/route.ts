// ============================================
// FIXED: app/api/functionalities/route.ts
// Now includes all 5 default fields (with attachments)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Functionality from '@/models/Functionality';

// GET - Fetch all functionalities for a department
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    
    if (!department) {
      return NextResponse.json(
        { error: 'Department parameter is required' },
        { status: 400 }
      );
    }

    const functionalities = await Functionality.find({ department })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ 
      success: true, 
      functionalities 
    });
  } catch (error) {
    console.error('Error fetching functionalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch functionalities' },
      { status: 500 }
    );
  }
}

// POST - Create new functionality
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const body = await request.json();
    const { name, description, department, workflow, formSchema } = body;

    console.log('📝 Creating functionality with data:', {
      name,
      department,
      hasWorkflow: !!workflow,
      hasFormSchema: !!formSchema,
      formSchemaFields: formSchema?.fields?.length || 0,
      useDefaultFields: formSchema?.useDefaultFields
    });

    // Validation
    if (!name || !department || !workflow) {
      return NextResponse.json(
        { error: 'Name, department, and workflow are required' },
        { status: 400 }
      );
    }

    if (!workflow.nodes || workflow.nodes.length < 3) {
      return NextResponse.json(
        { error: 'Workflow must have at least start, one employee, and end nodes' },
        { status: 400 }
      );
    }

    // Prepare the data
    const functionalityData: any = {
      name,
      description: description || '',
      department,
      workflow,
    };

    // Build formSchema - ALWAYS include defaults if useDefaultFields is true
    let finalFields: any[] = [];
    const useDefaults = !formSchema || formSchema.useDefaultFields !== false;
    
    console.log('🔧 Building formSchema:', { 
      useDefaults, 
      customFieldsCount: formSchema?.fields?.length || 0 
    });
    
    // STEP 1: Add default fields if enabled (NOW INCLUDING ATTACHMENTS!)
    if (useDefaults) {
      finalFields = [
        {
          id: 'default-title',
          type: 'text',
          label: 'Title',
          placeholder: 'Enter ticket title',
          required: true,
          order: 0
        },
        {
          id: 'default-description',
          type: 'textarea',
          label: 'Description',
          placeholder: 'Describe the issue in detail',
          required: true,
          order: 1
        },
        {
          id: 'default-urgency',
          type: 'dropdown',
          label: 'Urgency',
          required: true,
          options: ['Low', 'Medium', 'High'],
          order: 2
        },
        {
          id: 'default-urgency-reason',
          type: 'textarea',
          label: 'Reason for High Priority',
          placeholder: 'Explain why this is urgent (required for High priority)',
          required: false,
          order: 3
        },
        {
          id: 'default-attachments',
          type: 'file',
          label: 'Attachments',
          placeholder: 'Upload relevant files',
          required: false,
          order: 4
        }
      ];
      console.log('✅ Added 5 default fields (including attachments)');
    }
    
    // STEP 2: Append custom fields if any
    if (formSchema && formSchema.fields && formSchema.fields.length > 0) {
      console.log('➕ Appending custom fields:', formSchema.fields.length);
      const customFields = formSchema.fields.map((field: any, index: number) => ({
        ...field,
        order: finalFields.length + index
      }));
      finalFields = [...finalFields, ...customFields];
      console.log('✅ Total fields after append:', finalFields.length);
    }
    
    // Set the formSchema with explicit structure
    functionalityData.formSchema = {
      fields: finalFields,
      useDefaultFields: useDefaults
    };
    
    console.log('📋 Final formSchema structure check:');
    console.log('   - typeof formSchema:', typeof functionalityData.formSchema);
    console.log('   - has fields:', Array.isArray(functionalityData.formSchema.fields));
    console.log('   - fields count:', functionalityData.formSchema.fields.length);
    console.log('   - useDefaultFields:', functionalityData.formSchema.useDefaultFields);
    console.log('📄 Full FormSchema:', JSON.stringify(functionalityData.formSchema, null, 2));

    // Create the document - USING new + save() instead of create()
    console.log('💾 Creating new Functionality instance with data keys:', Object.keys(functionalityData));
    
    let functionality;
    try {
      // Create instance
      functionality = new Functionality(functionalityData);
      
      console.log('📦 Instance created, checking formSchema before save:');
      console.log('   - hasFormSchema:', !!functionality.formSchema);
      console.log('   - fieldCount:', functionality.formSchema?.fields?.length || 0);
      console.log('   - useDefaultFields:', functionality.formSchema?.useDefaultFields);
      console.log('   - Raw formSchema:', JSON.stringify(functionality.formSchema, null, 2));
      
      // Save to database
      await functionality.save();
      console.log('✅ Functionality.save() succeeded');
    } catch (createError: any) {
      console.error('❌ Functionality.save() FAILED:', createError);
      console.error('❌ Error name:', createError.name);
      console.error('❌ Error message:', createError.message);
      if (createError.errors) {
        console.error('❌ Validation errors:', JSON.stringify(createError.errors, null, 2));
      }
      throw createError;
    }
    
    console.log('✅ Functionality saved, ID:', functionality._id);
    
    // Fetch back from database to verify what was actually saved
    console.log('🔍 Fetching back from database to verify...');
    const savedDoc = await Functionality.findById(functionality._id).lean();
    console.log('🎯 ACTUAL SAVED DOCUMENT formSchema:');
    console.log('   - Fields count:', savedDoc?.formSchema?.fields?.length || 0);
    console.log('   - useDefaultFields:', savedDoc?.formSchema?.useDefaultFields);
    if (savedDoc?.formSchema?.fields) {
      console.log('   - Field details:', savedDoc.formSchema.fields.map((f: any) => `${f.label}(${f.type})`).join(', '));
    }
    console.log('📄 Full saved formSchema:', JSON.stringify(savedDoc?.formSchema, null, 2));

    return NextResponse.json({
      success: true,
      functionality: savedDoc
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating functionality:', error);
    return NextResponse.json(
      { error: 'Failed to create functionality' },
      { status: 500 }
    );
  }
}