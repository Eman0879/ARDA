// models/Project.js
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

const ProjectSchema = new mongoose.Schema({
  name: {
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
  assignees: [AssigneeSchema],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
    default: 'planning'
  },
  startDate: {
    type: Date,
    default: null
  },
  targetDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  mentions: [{
    type: String
  }],
  attachments: [AttachmentSchema],
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
  },
  color: {
    type: String,
    default: '#4ECDC4', // Teal default color
    validate: {
      validator: function(v) {
        return /^#[0-9A-F]{6}$/i.test(v);
      },
      message: props => `${props.value} is not a valid hex color!`
    }
  }
});

ProjectSchema.pre('save', function() {
  this.updatedAt = new Date();
});

ProjectSchema.virtual('taskCounts', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'projectId',
  count: true
});

// Existing indexes
ProjectSchema.index({ department: 1, status: 1 });
ProjectSchema.index({ 'assignees.employeeId': 1 });

// Enhanced indexes for project management queries
// Compound index for filtering by department, status, and priority
ProjectSchema.index({ department: 1, status: 1, priority: 1 });

// Index for date-based queries (timeline view, overdue projects)
ProjectSchema.index({ targetDate: 1, status: 1 });
ProjectSchema.index({ startDate: 1, targetDate: 1 });

// Index for finding projects by creator
ProjectSchema.index({ 'createdBy.employeeId': 1, createdAt: -1 });

// Index for active projects sorted by priority and target date
ProjectSchema.index({ status: 1, priority: -1, targetDate: 1 });

// Index for completed projects
ProjectSchema.index({ status: 1, completedAt: -1 });

// Index for recent activity (sorting by updatedAt)
ProjectSchema.index({ updatedAt: -1 });

// Index for mentions
ProjectSchema.index({ mentions: 1 });

// Text search index for project names and descriptions
ProjectSchema.index({ name: 'text', description: 'text' });

// Index for attachment queries
ProjectSchema.index({ 'attachments.uploadedAt': -1 });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);