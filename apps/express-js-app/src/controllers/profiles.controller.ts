// Express
import { Request, Response, NextFunction } from 'express';

// Multer
import multer from 'multer';

// Database
import { Profile, Session, User } from '@repo/database';
import { Types } from 'mongoose';

// Cloudflare R2
import { getR2Service } from '../services/r2.service';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes: Record<string, string[]> = {
      avatar: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      resume: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    const allowedForField = allowedMimes[file.fieldname];

    if (allowedForField && allowedForField.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}`));
    }
  }
});

// Middleware for handling files
export const uploadProfileFiles = (req: Request, res: Response, next: NextFunction) => {
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ])(req, res, next);
};

export class ProfilesController {
  static async createProfile(req: Request, res: Response) {
    try {
      // Get session token
      const sessionToken = req.cookies?.session;

      if (!sessionToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session token is required'
        });
      }

      // Find session in database
      const session = await Session.findOne({
        sessionToken: sessionToken,
        isActive: true
      });

      if (!session) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid session token'
        });
      }

      // Check if session has expired
      if (new Date() > session.expires) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session has expired'
        });
      }

      const userId = session.userId;

      // Check if profile already exists for this user
      const existingProfile = await Profile.findByUserId(userId);

      if (existingProfile) {
        return res.status(409).json({
          error: 'Profile already exists',
          message: 'A profile already exists for this user. Use PUT to update.'
        });
      }

      // Handle file uploads to R2
      let avatarUrl: string | undefined;
      let resumeUrl: string | undefined;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (files) {
        const r2Service = getR2Service();

        // Upload avatar if provided
        if (files.avatar && files.avatar[0]) {
          const avatarFile = files.avatar[0];
          const avatarResult = await r2Service.uploadFile(
            avatarFile.buffer,
            avatarFile.originalname,
            { folder: 'avatars' }
          );
          avatarUrl = avatarResult.url;
        }

        // Upload resume if provided
        if (files.resume && files.resume[0]) {
          const resumeFile = files.resume[0];
          const resumeResult = await r2Service.uploadFile(
            resumeFile.buffer,
            resumeFile.originalname,
            { folder: 'resumes' }
          );
          resumeUrl = resumeResult.url;
        }
      }

      // Parse JSON data from request body
      let education, experiences, organizations;

      try {
        education = typeof req.body.education === 'string'
          ? JSON.parse(req.body.education)
          : req.body.education;

        experiences = req.body.experiences
          ? (typeof req.body.experiences === 'string'
            ? JSON.parse(req.body.experiences)
            : req.body.experiences)
          : [];

        organizations = req.body.organizations
          ? (typeof req.body.organizations === 'string'
            ? JSON.parse(req.body.organizations)
            : req.body.organizations)
          : [];
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid data format',
          message: 'Failed to parse education, experiences, or organizations data'
        });
      }

      const {
        name,
        email,
        class: userClass,
        house
      } = req.body;

      // Validate required fields
      if (!name || !email || !userClass) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, email, and class are required'
        });
      }

      // Validate education array
      if (!education || !Array.isArray(education) || education.length === 0) {
        return res.status(400).json({
          error: 'Invalid education data',
          message: 'At least one education entry is required'
        });
      }

      // Create new profile
      const newProfile = new Profile({
        userId,
        name,
        email,
        class: userClass,
        house,
        avatar: avatarUrl,
        resume: resumeUrl,
        education,
        experiences,
        organizations,
      });

      const savedProfile = await newProfile.save();

      return res.status(201).json({
        success: true,
        message: 'Profile created successfully',
        profile: savedProfile
      });

    } catch (error) {
      console.error('Create profile error:', error);

      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while creating profile'
      });
    }
  }

  static async getMyProfile(req: Request, res: Response) {
    try {
      // Get session token
      const sessionToken = req.cookies?.session;

      if (!sessionToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session token is required'
        });
      }

      // Find session in database
      const session = await Session.findOne({
        sessionToken: sessionToken,
        isActive: true
      });

      if (!session) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid session token'
        });
      }

      // Check if session has expired
      if (new Date() > session.expires) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session has expired'
        });
      }

      const userId = session.userId;

      // Find profile
      const profile = await (await Profile.findByUserId(userId))?.populate('userId', 'name email');

      if (!profile) {
        return res.status(404).json({
          error: 'Profile not found',
          message: 'No profile found for this user'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('Get my profile error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching profile'
      });
    }
  }

  static async getProfileByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      // Validate userId format
      if (!userId || !Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          error: 'Invalid user ID',
          message: 'Please provide a valid user ID'
        });
      }

      // Find profile
      const profile = await (await Profile.findByUserId(userId))?.populate('userId', 'name email');

      if (!profile) {
        return res.status(404).json({
          error: 'Profile not found',
          message: 'No profile found for this user'
        });
      }

      return res.status(200).json({
        success: true,
        profile
      });

    } catch (error) {
      console.error('Get profile by user ID error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching profile'
      });
    }
  }

  static async updateProfile(req: Request, res: Response) {
    try {
      // Get session token
      const sessionToken = req.cookies?.session;

      if (!sessionToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session token is required'
        });
      }

      // Find session in database
      const session = await Session.findOne({
        sessionToken: sessionToken,
        isActive: true
      });

      if (!session) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid session token'
        });
      }

      // Check if session has expired
      if (new Date() > session.expires) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session has expired'
        });
      }

      const userId = session.userId;

      // Find existing profile
      const existingProfile = await Profile.findByUserId(userId);

      if (!existingProfile) {
        return res.status(404).json({
          error: 'Profile not found',
          message: 'No profile found for this user. Use POST to create.'
        });
      }

      // Handle file uploads to R2
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      if (files) {
        const r2Service = getR2Service();

        // Upload new avatar if provided
        if (files.avatar && files.avatar[0]) {
          // Delete old avatar if it exists
          if (existingProfile.avatar) {
            try {
              // Extract key from URL (everything after the domain)
              const url = new URL(existingProfile.avatar);
              const oldAvatarKey = url.pathname.substring(1); // Remove leading slash
              await r2Service.deleteFile(oldAvatarKey);
            } catch (deleteError) {
              console.error('Failed to delete old avatar:', deleteError);
            }
          }

          const avatarFile = files.avatar[0];
          const avatarResult = await r2Service.uploadFile(
            avatarFile.buffer,
            avatarFile.originalname,
            { folder: 'avatars' }
          );
          existingProfile.avatar = avatarResult.url;
        }

        // Upload new resume if provided
        if (files.resume && files.resume[0]) {
          // Delete old resume if it exists
          if (existingProfile.resume) {
            try {
              // Extract key from URL (everything after the domain)
              const url = new URL(existingProfile.resume);
              const oldResumeKey = url.pathname.substring(1); // Remove leading slash
              await r2Service.deleteFile(oldResumeKey);
            } catch (deleteError) {
              console.error('Failed to delete old resume:', deleteError);
            }
          }

          const resumeFile = files.resume[0];
          const resumeResult = await r2Service.uploadFile(
            resumeFile.buffer,
            resumeFile.originalname,
            { folder: 'resumes' }
          );
          existingProfile.resume = resumeResult.url;
        }
      }

      // Parse JSON data from request body
      let education, experiences, organizations;

      try {
        if (req.body.education) {
          education = typeof req.body.education === 'string'
            ? JSON.parse(req.body.education)
            : req.body.education;
        }

        if (req.body.experiences !== undefined) {
          experiences = typeof req.body.experiences === 'string'
            ? JSON.parse(req.body.experiences)
            : req.body.experiences;
        }

        if (req.body.organizations !== undefined) {
          organizations = typeof req.body.organizations === 'string'
            ? JSON.parse(req.body.organizations)
            : req.body.organizations;
        }
      } catch (parseError) {
        return res.status(400).json({
          error: 'Invalid data format',
          message: 'Failed to parse education, experiences, or organizations data'
        });
      }

      const {
        name,
        email,
        class: userClass,
        house
      } = req.body;

      // Update fields
      if (name) existingProfile.name = name;
      if (email) existingProfile.email = email;
      if (userClass) existingProfile.class = userClass;
      if (house !== undefined) existingProfile.house = house;
      if (education) existingProfile.education = education;
      if (experiences !== undefined) existingProfile.experiences = experiences;
      if (organizations !== undefined) existingProfile.organizations = organizations;

      const updatedProfile = await existingProfile.save();

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile
      });

    } catch (error) {
      console.error('Update profile error:', error);

      if (error instanceof Error && error.name === 'ValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          message: error.message
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while updating profile'
      });
    }
  }

  static async deleteProfile(req: Request, res: Response) {
    try {
      // Get session token
      const sessionToken = req.cookies?.session;

      if (!sessionToken) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session token is required'
        });
      }

      // Find session in database
      const session = await Session.findOne({
        sessionToken: sessionToken,
        isActive: true
      });

      if (!session) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid session token'
        });
      }

      // Check if session has expired
      if (new Date() > session.expires) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Session has expired'
        });
      }

      const userId = session.userId;

      // Find and delete profile
      const deletedProfile = await Profile.findOneAndDelete({ userId });

      if (!deletedProfile) {
        return res.status(404).json({
          error: 'Profile not found',
          message: 'No profile found for this user'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile deleted successfully'
      });

    } catch (error) {
      console.error('Delete profile error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while deleting profile'
      });
    }
  }

  static async getAllProfiles(req: Request, res: Response) {
    try {
      // Find all profiles
      const profiles = await Profile.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        profiles
      });

    } catch (error) {
      console.error('Get all profiles error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while fetching profiles'
      });
    }
  }
}

