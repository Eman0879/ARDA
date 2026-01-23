// ============================================
// UPDATED: models/Functionality.ts
// Added isActive field for toggling functionality visibility
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
  isActive: boolean;
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
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  strict: true
});

// Indexes for efficient queries
FunctionalitySchema.index({ department: 1, createdAt: -1 });
FunctionalitySchema.index({ department: 1, isActive: 1 });
FunctionalitySchema.index({ name: 'text', description: 'text' });

// Add a post-save hook for debugging
FunctionalitySchema.post('save', function(doc) {
  console.log('🔍 POST-SAVE HOOK - Document saved:', {
    id: doc._id,
    name: doc.name,
    isActive: doc.isActive,
    hasFormSchema: !!doc.formSchema,
    fieldCount: doc.formSchema?.fields?.length || 0
  });
});

export default mongoose.models.Functionality || 
  mongoose.model<IFunctionality>('Functionality', FunctionalitySchema);