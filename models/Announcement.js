// models/Announcement.js
import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
});

const AttachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'document'],
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  }
});

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: false, // ← CHANGE TO FALSE or remove this field entirely
    default: 'System' // ← Add default
  },
  department: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
  urgent: {
    type: Boolean,
    default: false,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  expirationDate: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  comments: [CommentSchema],
  color: { // ← CHANGE from "borderColor" to "color"
    type: String,
    default: '#0000FF', // ← Match old default
  },
  attachments: [AttachmentSchema],
});

// ===== OPTIMIZED INDEXES (NO DUPLICATES) =====

AnnouncementSchema.index({ isDeleted: 1, department: 1, createdAt: -1 });
AnnouncementSchema.index({ isDeleted: 1, pinned: -1, urgent: -1, createdAt: -1 });
AnnouncementSchema.index({ author: 1, createdAt: -1 });
AnnouncementSchema.index({ expirationDate: 1, isDeleted: 1 });
AnnouncementSchema.index({ title: 'text', content: 'text' });
AnnouncementSchema.index({ 'comments.author': 1 });
AnnouncementSchema.index({ 'comments.createdAt': -1 });
AnnouncementSchema.index({ 'attachments.uploadedAt': -1 });
AnnouncementSchema.index({ 'attachments.type': 1 });

export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);