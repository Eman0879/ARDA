// ============================================
// FIXED: models/Functionality.ts
// Properly structured formSchema to ensure it saves to DB
// ============================================

import mongoose, { Schema, Document } from 'mongoose';

interface IWorkflowNode {
  id: string;
  type: 'start' | 'employee' | 'end';
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    employeeId?: string;
    employeeName?: string;
    employeeTitle?: string;
    employeeAvatar?: string;
    nodeType?: 'sequential' | 'parallel';
    groupLead?: string;
    groupMembers?: string[];
  };
}

interface IWorkflowEdge {
  id: string;
  source: string;
  target: string;
}

interface IFormField {
  id: string;
  type: 'text' | 'textarea' | 'dropdown' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'table';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  tableConfig?: {
    columns: {
      id: string;
      label: string;
      type: 'text' | 'number' | 'dropdown' | 'date';
      options?: string[];
    }[];
    minRows?: number;
    maxRows?: number;
  };
  order: number;
}

interface IFunctionality extends Document {
  name: string;
  description: string;
  department: string;
  workflow: {
    nodes: IWorkflowNode[];
    edges: IWorkflowEdge[];
  };
  formSchema: {
    fields: IFormField[];
    useDefaultFields: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['start', 'employee', 'end'], 
    required: true 
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  data: {
    label: { type: String, required: true },
    employeeId: String,
    employeeName: String,
    employeeTitle: String,
    employeeAvatar: String,
    nodeType: { 
      type: String, 
      enum: ['sequential', 'parallel'],
      default: 'sequential'
    },
    groupLead: String,
    groupMembers: [String]
  }
}, { _id: false });

const WorkflowEdgeSchema = new Schema({
  id: { type: String, required: true },
  source: { type: String, required: true },
  target: { type: String, required: true }
}, { _id: false });

// FIXED: Simplified FormFieldSchema with proper Mixed type for complex fields
const FormFieldSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: ['text', 'textarea', 'dropdown', 'radio', 'checkbox', 'number', 'date', 'file', 'table'],
    required: true
  },
  label: { type: String, required: true },
  placeholder: { type: String, required: false },
  required: { type: Boolean, default: false },
  options: { type: [String], required: false },
  validation: {
    type: Schema.Types.Mixed,
    required: false
  },
  tableConfig: {
    type: Schema.Types.Mixed,
    required: false
  },
  order: { type: Number, required: true }
}, { _id: false });

const FunctionalitySchema = new Schema<IFunctionality>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  department: {
    type: String,
    required: true,
    index: true
  },
  workflow: {
    nodes: {
      type: [WorkflowNodeSchema],
      required: true
    },
    edges: {
      type: [WorkflowEdgeSchema],
      required: true
    }
  },
  // FIXED: Explicitly define formSchema structure
  formSchema: {
    type: {
      fields: {
        type: [FormFieldSchema],
        default: []
      },
      useDefaultFields: {
        type: Boolean,
        default: true
      }
    },
    required: false,
    default: () => ({
      fields: [],
      useDefaultFields: true
    })
  }
}, {
  timestamps: true,
  // CRITICAL: Ensure strict mode doesn't strip fields
  strict: true
});

// Indexes for efficient queries
FunctionalitySchema.index({ department: 1, createdAt: -1 });
FunctionalitySchema.index({ name: 'text', description: 'text' });

// Add a post-save hook for debugging
FunctionalitySchema.post('save', function(doc) {
  console.log('🔍 POST-SAVE HOOK - Document saved with formSchema:', {
    id: doc._id,
    hasFormSchema: !!doc.formSchema,
    fieldCount: doc.formSchema?.fields?.length || 0,
    useDefaultFields: doc.formSchema?.useDefaultFields
  });
});

export default mongoose.models.Functionality || 
  mongoose.model<IFunctionality>('Functionality', FunctionalitySchema);