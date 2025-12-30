// models/Sprint.js
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

const NoteSchema = new mongoose.Schema({
  author: {
    employeeId: String,
    name: String
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

const SprintSchema = new mongoose.Schema({
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
    enum: ['pending', 'in-progress', 'review', 'completed', 'blocked'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    default: 0
  },
  blockerReason: {
    type: String,
    default: null
  },
  mentions: [{
    type: String
  }],
  notes: [NoteSchema],
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

SprintSchema.pre('save', function() {
  this.updatedAt = new Date();
});

// Existing indexes
SprintSchema.index({ department: 1, status: 1 });
SprintSchema.index({ 'assignees.employeeId': 1 });
SprintSchema.index({ dueDate: 1 });

// Enhanced indexes for sprint management
// Compound index for department, status, and priority sorting
SprintSchema.index({ department: 1, status: 1, priority: -1 });

// Index for overdue sprints
SprintSchema.index({ status: 1, dueDate: 1 });

// Index for completed sprints
SprintSchema.index({ status: 1, completedAt: -1 });

// Index for blocked sprints
SprintSchema.index({ status: 1, blockerReason: 1 });

// Index for assignee queries with status
SprintSchema.index({ 'assignees.employeeId': 1, status: 1, dueDate: 1 });

// Index for creator queries
SprintSchema.index({ 'createdBy.employeeId': 1, createdAt: -1 });

// Index for recent updates
SprintSchema.index({ updatedAt: -1 });

// Index for mentions
SprintSchema.index({ mentions: 1 });

// Text search index for titles and descriptions
SprintSchema.index({ title: 'text', description: 'text' });

// Index for feedback queries
SprintSchema.index({ 'feedback.createdAt': -1 });
SprintSchema.index({ 'feedback.action': 1 });

// Index for note queries
SprintSchema.index({ 'notes.createdAt': -1 });

// Index for attachment queries
SprintSchema.index({ 'attachments.uploadedAt': -1 });

export default mongoose.models.Sprint || mongoose.model('Sprint', SprintSchema);