// ============================================
// UPDATED: types.ts
// Added form schema types
// ============================================

export interface Employee {
  _id: string;
  basicDetails: {
    name: string;
    profileImage?: string;
  };
  title: string;
  department: string;
}

export interface WorkflowNode {
  id: string;
  type: 'start' | 'employee' | 'end';
  position: { x: number; y: number };
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

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface FormField {
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

export interface FormSchema {
  fields: FormField[];
  useDefaultFields: boolean;
}

export interface Functionality {
  _id: string;
  name: string;
  description: string;
  department: string;
  workflow: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  formSchema: FormSchema;
  createdAt: string;
  updatedAt: string;
}