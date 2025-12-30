// models/UserPreference.js
import mongoose from 'mongoose';

const UserPreferenceSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    // You can add more preferences here in the future
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    notifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Additional indexes for preference queries
// Username is already unique and indexed

// Index for filtering users by theme preference
UserPreferenceSchema.index({ theme: 1 });

// Index for notification settings
UserPreferenceSchema.index({ notifications: 1 });

// Prevent model recompilation in development
const UserPreference = mongoose.models.UserPreference || mongoose.model('UserPreference', UserPreferenceSchema);

export default UserPreference;