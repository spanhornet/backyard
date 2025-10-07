import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  sessionToken: string;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  lastAccessedAt: Date;
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
  location?: {
    country?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

const SessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    sessionToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 },
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    deviceInfo: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
      },
      os: String,
      browser: String,
    },
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
  },
  {
    timestamps: true,
    collection: 'sessions',
  }
);

// Compound indexes for efficient queries
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ sessionToken: 1, isActive: 1 });
SessionSchema.index({ expires: 1, isActive: 1 });

// Pre-save middleware to update lastAccessedAt
SessionSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastAccessedAt = new Date();
  }
  next();
});

// Static method to find active sessions for a user
SessionSchema.statics.findActiveSessionsByUserId = function (userId: Types.ObjectId) {
  return this.find({
    userId,
    isActive: true,
    expires: { $gt: new Date() },
  }).sort({ lastAccessedAt: -1 });
};

// Static method to invalidate all sessions for a user
SessionSchema.statics.invalidateUserSessions = function (userId: Types.ObjectId) {
  return this.updateMany(
    { userId, isActive: true },
    { isActive: false, updatedAt: new Date() }
  );
};

// Instance method to refresh session
SessionSchema.methods.refresh = function (newExpiryDate: Date) {
  this.expires = newExpiryDate;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Instance method to invalidate session
SessionSchema.methods.invalidate = function () {
  this.isActive = false;
  this.updatedAt = new Date();
  return this.save();
};

export const Session = mongoose.model<ISession>('Session', SessionSchema);
export default Session;
