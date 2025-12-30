// models/Task.js
import mongoose from 'mongoose';

const AssigneeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
}, { _id: false });

const CommentSchema = new mongoose.Schema({
  author: {
    employeeId: String,
    name: String,
    email: String
  },
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  type: String, // 'image' or 'file'
  uploadedBy: {
    employeeId: String,
    name: String
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const FeedbackSchema = new mongoose.Schema({
  author: {
    employeeId: String,
    name: String,
    email: String
  },
  content: String,
  action: String, // 'submitted', 'approved', 'rejected', 'reopened'
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const TaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  assignees: {
    type: [AssigneeSchema],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'At least one assignee is required'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'blocked', 'completed'],
    default: 'todo'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  blockerReason: {
    type: String,
    default: null
  },
  mentions: [{
    type: String
  }],
  comments: [CommentSchema],
  attachments: [AttachmentSchema],
  feedback: [FeedbackSchema],
  createdBy: {
    employeeId: String,
    name: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TaskSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Existing indexes
TaskSchema.index({ department: 1, status: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ 'assignees.employeeId': 1 });
TaskSchema.index({ dueDate: 1 });

// Enhanced indexes for task management
// Compound index for project tasks sorted by status and priority
TaskSchema.index({ projectId: 1, status: 1, priority: -1 });

// Index for department tasks with priority
TaskSchema.index({ department: 1, status: 1, priority: -1 });

// Index for assignee tasks with status and due date
TaskSchema.index({ 'assignees.employeeId': 1, status: 1, dueDate: 1 });

// Index for overdue tasks
TaskSchema.index({ status: 1, dueDate: 1 });

// Index for completed tasks
TaskSchema.index({ status: 1, completedAt: -1 });

// Index for blocked tasks
TaskSchema.index({ status: 1, blockerReason: 1 });

// Index for creator queries
TaskSchema.index({ 'createdBy.employeeId': 1, createdAt: -1 });

// Index for recent updates
TaskSchema.index({ updatedAt: -1 });

// Index for project tasks by due date
TaskSchema.index({ projectId: 1, dueDate: 1 });

// Index for mentions
TaskSchema.index({ mentions: 1 });

// Text search index for titles and descriptions
TaskSchema.index({ title: 'text', description: 'text' });

// Index for comment queries
TaskSchema.index({ 'comments.createdAt': -1 });
TaskSchema.index({ 'comments.author.employeeId': 1 });

// Index for feedback queries
TaskSchema.index({ 'feedback.createdAt': -1 });
TaskSchema.index({ 'feedback.action': 1 });

// Index for attachment queries
TaskSchema.index({ 'attachments.uploadedAt': -1 });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);