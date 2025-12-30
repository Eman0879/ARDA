// models/User.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  password: string;
  role: 'employee.other' | 'employee.hr' | 'depthead.hr' | 'depthead.other' | 'admin';
  displayName: string;
  department: string;
  title: string;
  isDeptHead: boolean;
  photoUrl?: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['employee.other', 'employee.hr', 'depthead.hr', 'depthead.other', 'admin'],
    },
    displayName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    isDeptHead: {
      type: Boolean,
      default: false,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimized user queries
// Username is already unique and automatically indexed

// Index for filtering users by department
UserSchema.index({ department: 1, displayName: 1 });

// Index for filtering by role
UserSchema.index({ role: 1 });

// Index for finding department heads
UserSchema.index({ isDeptHead: 1, department: 1 });

// Compound index for role-based department queries
UserSchema.index({ department: 1, role: 1 });

// Index for email lookup (if searching/filtering by email)
UserSchema.index({ email: 1 }, { sparse: true });

// Text search index for searching by display name, username, email
UserSchema.index({ displayName: 'text', username: 'text', email: 'text' });

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;