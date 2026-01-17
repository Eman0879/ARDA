// models/ProjectManagement/Project.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IMember {
  userId: string;
  username?: string; // NEW: Store username alongside userId for querying
  name: string;
  role: 'lead' | 'member' | 'dept-head';
  department?: string; // NEW: Track member's department for cross-dept projects
  joinedAt: Date;
  leftAt?: Date;
}

interface IComment {
  userId: string;
  userName: string;
  message: string;
  createdAt: Date;
}

interface IHistoryEntry {
  action: string;
  performedBy: string;
  performedByName: string;
  timestamp: Date;
  details?: string;
}

interface IBlocker {
  description: string;
  reportedBy: string;
  reportedAt: Date;
  isResolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  attachments?: string[];
}

interface IDeliverable {
  _id?: string;
  title: string;
  description: string;
  assignedTo: string[];
  status: 'pending' | 'in-progress' | 'in-review' | 'done';
  dueDate?: Date;
  attachments: string[];
  blockers: IBlocker[];
  comments: IComment[];
  history: IHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  submittedBy?: string;
  submissionNote?: string;
  submissionAttachments?: string[];
}

interface IChatMessage {
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

interface IProject extends Document {
  projectNumber: string;
  title: string;
  description: string;
  department: string;
  createdBy: string;
  createdByName: string;
  members: IMember[];
  groupLead: string;
  startDate: Date;
  targetEndDate: Date;
  actualEndDate?: Date;
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  deliverables: IDeliverable[];
  chat: IChatMessage[];
  health: 'healthy' | 'at-risk' | 'delayed' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>({
  userId: { type: String, required: true },
  username: { type: String }, // NEW: For username-based queries
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['lead', 'member', 'dept-head'], 
    default: 'member' 
  },
  department: { type: String }, // NEW: Track member's home department
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date }
});

const CommentSchema = new Schema<IComment>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const HistoryEntrySchema = new Schema<IHistoryEntry>({
  action: { type: String, required: true },
  performedBy: { type: String, required: true },
  performedByName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
});

const BlockerSchema = new Schema<IBlocker>({
  description: { type: String, required: true },
  reportedBy: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
  isResolved: { type: Boolean, default: false },
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  attachments: [{ type: String }]
});

const DeliverableSchema = new Schema<IDeliverable>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: [{ type: String }],
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'in-review', 'done'],
    default: 'pending'
  },
  dueDate: { type: Date },
  attachments: [{ type: String }],
  blockers: [BlockerSchema],
  comments: [CommentSchema],
  history: [HistoryEntrySchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  submittedBy: { type: String },
  submissionNote: { type: String },
  submissionAttachments: [{ type: String }]
});

const ChatMessageSchema = new Schema<IChatMessage>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ProjectSchema = new Schema<IProject>({
  projectNumber: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  department: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdByName: { type: String, required: true },
  members: [MemberSchema],
  groupLead: { type: String, required: true },
  startDate: { type: Date, required: true },
  targetEndDate: { type: Date, required: true },
  actualEndDate: { type: Date },
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'on-hold'],
    default: 'active'
  },
  deliverables: [DeliverableSchema],
  chat: [ChatMessageSchema],
  health: {
    type: String,
    enum: ['healthy', 'at-risk', 'delayed', 'critical'],
    default: 'healthy'
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ProjectSchema.index({ projectNumber: 1 });
ProjectSchema.index({ department: 1, status: 1 });
ProjectSchema.index({ 'members.userId': 1 });
ProjectSchema.index({ 'members.username': 1 }); // NEW: Index for username queries
ProjectSchema.index({ 'members.role': 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);