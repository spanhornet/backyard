import mongoose, { Document, Schema, Types, Model } from 'mongoose';

// Education subdocument interface
export interface IEducation {
  university: string;
  degreeName: string;
  degreeType: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  description?: string;
}

// Experience subdocument interface
export interface IExperience {
  company: string;
  location: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  description?: string;
}

// Organization subdocument interface
export interface IOrganization {
  name: string;
  position: string;
  startMonth: string;
  startYear: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
  description?: string;
}

// Main Profile document interface
export interface IProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  email: string;
  class: string;
  house?: string;
  avatar?: string;
  resume?: string;
  education: IEducation[];
  experiences: IExperience[];
  organizations: IOrganization[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProfileModel extends Model<IProfile> {
  findByUserId(userId: Types.ObjectId | string): Promise<IProfile | null>;
}

// Education subdocument schema
const EducationSchema = new Schema<IEducation>({
  university: {
    type: String,
    required: true,
    trim: true,
  },
  degreeName: {
    type: String,
    required: true,
    trim: true,
  },
  degreeType: {
    type: String,
    required: true,
    trim: true,
  },
  startMonth: {
    type: String,
    required: true,
  },
  startYear: {
    type: String,
    required: true,
  },
  endMonth: {
    type: String,
    trim: true,
  },
  endYear: {
    type: String,
    trim: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Experience subdocument schema
const ExperienceSchema = new Schema<IExperience>({
  company: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  startMonth: {
    type: String,
    required: true,
  },
  startYear: {
    type: String,
    required: true,
  },
  endMonth: {
    type: String,
    trim: true,
  },
  endYear: {
    type: String,
    trim: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Organization subdocument schema
const OrganizationSchema = new Schema<IOrganization>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  position: {
    type: String,
    required: true,
    trim: true,
  },
  startMonth: {
    type: String,
    required: true,
  },
  startYear: {
    type: String,
    required: true,
  },
  endMonth: {
    type: String,
    trim: true,
  },
  endYear: {
    type: String,
    trim: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
  },
}, { _id: false });

// Main Profile schema
const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address'],
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    house: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      trim: true,
    },
    education: {
      type: [EducationSchema],
      default: [],
      validate: {
        validator: function (arr: IEducation[]) {
          return arr.length >= 1;
        },
        message: 'At least one education entry is required'
      }
    },
    experiences: {
      type: [ExperienceSchema],
      default: [],
    },
    organizations: {
      type: [OrganizationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'profiles',
  }
);

// Indexes for efficient queries
// Note: userId already has a unique index from the field definition
ProfileSchema.index({ email: 1 });
ProfileSchema.index({ class: 1 });
ProfileSchema.index({ house: 1 });

// Pre-save middleware to update timestamps
ProfileSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

// Static method to find profile by userId
ProfileSchema.statics.findByUserId = function (userId: Types.ObjectId | string) {
  return this.findOne({ userId });
};

// Ensure virtual fields are serialized
ProfileSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  },
});

export const Profile = mongoose.model<IProfile, IProfileModel>('Profile', ProfileSchema);
export default Profile;

