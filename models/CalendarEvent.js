// ===== models/CalendarEvent.js =====
import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['task', 'deadline', 'meeting', 'reminder'],
    required: true
  },
  startDate: {
    type: Date,
    required: true,
    index: true
  },
  endDate: {
    type: Date
  },
  startTime: {
    type: String // Format: "HH:MM"
  },
  endTime: {
    type: String // Format: "HH:MM"
  },
  color: {
    type: String,
    required: true
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    minutesBefore: {
      type: Number,
      default: 15
    }
  }
}, {
  timestamps: true
});

// Existing compound indexes for efficient queries
calendarEventSchema.index({ userId: 1, startDate: 1 });
calendarEventSchema.index({ userId: 1, type: 1 });

// Enhanced indexes for calendar view optimization
// Index for date range queries (weekly/monthly calendar views)
calendarEventSchema.index({ startDate: 1, endDate: 1 });

// Compound index for filtering by user, type, and date range
calendarEventSchema.index({ userId: 1, type: 1, startDate: 1 });

// Index for filtering completed vs incomplete tasks
calendarEventSchema.index({ userId: 1, completed: 1, startDate: 1 });

// Index for reminder queries (finding events with reminders enabled)
calendarEventSchema.index({ 'reminder.enabled': 1, startDate: 1 });

// Index for finding all-day events
calendarEventSchema.index({ userId: 1, isAllDay: 1, startDate: 1 });

// Text search index for searching event titles and descriptions
calendarEventSchema.index({ title: 'text', description: 'text' });

export default mongoose.models.CalendarEvent || mongoose.model('CalendarEvent', calendarEventSchema);