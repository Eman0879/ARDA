// ===== models/Appointment.js =====
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  requesterId: {
    type: String,
    required: true
  },
  requesterUsername: {
    type: String,
    required: true
  },
  requestedId: {
    type: String,
    required: true
  },
  requestedUsername: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  proposedDate: {
    type: Date,
    required: true
  },
  proposedStartTime: {
    type: String,
    required: true
  },
  proposedEndTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'counter-proposed'],
    default: 'pending'
  },
  currentOwner: {
    type: String,
    required: true
  },
  counterProposal: {
    date: Date,
    startTime: String,
    endTime: String,
    reason: String
  },
  declineReason: {
    type: String
  },
  history: [{
    action: {
      type: String,
      required: true
    },
    by: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    }
  }]
}, { 
  timestamps: true 
});

// Existing indexes for better query performance
appointmentSchema.index({ requesterUsername: 1, createdAt: -1 });
appointmentSchema.index({ requestedUsername: 1, createdAt: -1 });
appointmentSchema.index({ status: 1 });

// Additional indexes for common query patterns
// Compound index for filtering appointments by user and status
appointmentSchema.index({ requesterUsername: 1, status: 1, proposedDate: 1 });
appointmentSchema.index({ requestedUsername: 1, status: 1, proposedDate: 1 });

// Index for current owner queries (finding appointments pending action)
appointmentSchema.index({ currentOwner: 1, status: 1, proposedDate: 1 });

// Index for date-based queries (calendar views, upcoming appointments)
appointmentSchema.index({ proposedDate: 1, proposedStartTime: 1 });

// Compound index for finding all appointments involving a user (either as requester or requested)
appointmentSchema.index({ requesterId: 1, proposedDate: -1 });
appointmentSchema.index({ requestedId: 1, proposedDate: -1 });

export default mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);