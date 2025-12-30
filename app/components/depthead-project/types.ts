// app/components/depthead-project/types.ts

export interface TeamMember {
  username: string;
  displayName: string;
  email: string;
}

export interface Assignee {
  employeeId: string;
  name: string;
  email: string;
}

export interface Attachment {
  filename: string;
  url: string;
  type: 'image' | 'file';
  uploadedBy: {
    employeeId: string;
    name: string;
  };
  uploadedAt: string;
}

export interface Feedback {
  author: {
    employeeId: string;
    name: string;
    email: string;
  };
  content: string;
  action: 'submitted' | 'approved' | 'rejected' | 'reopened';
  createdAt: string;
}

export interface Sprint {
  _id: string;
  title: string;
  description: string;
  assignees: Assignee[];
  priority: string;
  status: string;
  dueDate: string;
  completedAt?: string;
  estimatedHours: number;
  mentions: string[];
  attachments?: Attachment[];
  feedback?: Feedback[];
  blockerReason?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  assignees: Assignee[];
  status: string;
  priority: string;
  startDate?: string;
  targetDate?: string;
  mentions: string[];
  attachments?: Attachment[];
  taskCounts?: {
    total: number;
    todo: number;
    'in-progress': number;
    review: number;
    blocked: number;
    completed: number;
  };
}

export interface Task {
  _id: string;
  projectId: { _id: string; name: string; status: string };
  title: string;
  description: string;
  assignees: Assignee[];
  status: string;
  priority: string;
  dueDate?: string;
  mentions: string[];
  attachments?: Attachment[];
  feedback?: Feedback[];
  blockerReason?: string;
  comments?: Array<{
    author: { employeeId: string; name: string; email: string };
    content: string;
    createdAt: string;
  }>;
}

export type ActiveTab = 'sprints' | 'projects' | 'tasks';