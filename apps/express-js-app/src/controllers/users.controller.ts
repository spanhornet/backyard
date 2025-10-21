// Node.js
import crypto from 'crypto';

// Express
import { Request, Response } from 'express';

// Database
import { User, Session } from '@repo/database';

// Stytch
import { stytchClient } from '../services/stytch.service';

export class UsersController {
  static async signIn(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: 'Email is required',
          message: 'Please provide an email'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          message: 'Please provide a valid email'
        });
      }

      // Check if user exists in database
      const existingUser = await User.findByEmail(email);

      if (!existingUser) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No account found with this email'
        });
      }

      // Send magic link
      const magicLinkParams = {
        email: email,
        login_magic_link_url: `${process.env.FRONTEND_URL}/verify-magic-link`,
        signup_magic_link_url: `${process.env.FRONTEND_URL}/verify-magic-link`,
      };

      const stytchResponse = await stytchClient.magicLinks.email.loginOrCreate(magicLinkParams);

      return res.status(200).json({
        success: true,
        message: 'Magic link sent successfully',
        user_id: stytchResponse.user_id,
        request_id: stytchResponse.request_id
      });

    } catch (error) {
      console.error('Sign in error:', error);

      // Handle Stytch-specific errors
      if (error instanceof Error && 'error_type' in error) {
        return res.status(400).json({
          error: 'Authentication service error',
          message: error.message || 'Failed to send magic link'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while signing in'
      });
    }
  }

  static async signUp(req: Request, res: Response) {
    try {
      const { name, email } = req.body;

      if (!email || !name) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Please provide both name and email'
        });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Invalid email format',
          message: 'Please provide a valid email'
        });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({
          error: 'Invalid name',
          message: 'Name must be at least 2 characters long'
        });
      }

      // Check if user exists in database
      const existingUser = await User.findByEmail(email);

      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Create new user in database
      const newUser = new User({
        name: name.trim(),
        email: email.toLowerCase(),
      });

      const createdUser = await newUser.save();

      // Send magic link
      const magicLinkParams = {
        email: email,
        login_magic_link_url: `${process.env.FRONTEND_URL}/verify-magic-link`,
        signup_magic_link_url: `${process.env.FRONTEND_URL}/verify-magic-link`,
      };

      const stytchResponse = await stytchClient.magicLinks.email.loginOrCreate(magicLinkParams);

      await createdUser.save();

      return res.status(201).json({
        success: true,
        message: 'Magic link sent to your email',
        user: {
          id: createdUser._id,
          name: createdUser.name,
          email: createdUser.email,
        },
        stytch: {
          user_id: stytchResponse.user_id,
          request_id: stytchResponse.request_id
        }
      });

    } catch (error) {
      console.error('Sign up error:', error);

      // Handle Stytch-specific errors
      if (error instanceof Error && 'error_type' in error) {
        return res.status(400).json({
          error: 'Authentication service error',
          message: error.message || 'Failed to send magic link'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while signing up'
      });
    }
  }

  static async signOut(req: Request, res: Response) {
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

      // Invalidate session
      session.isActive = false;
      await session.save();

      // Clear cookie
      res.clearCookie('session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        path: '/'
      });

      return res.status(200).json({
        success: true,
        message: 'Successfully signed out'
      });

    } catch (error) {
      console.error('Sign out error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while signing out'
      });
    }
  }

  static async verifyMagicLink(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          error: 'Token is required',
          message: 'Magic link token is missing'
        });
      }

      const verificationResponse = await stytchClient.magicLinks.authenticate({
        token: token
      });

      // Get user
      const stytchUser = verificationResponse.user;
      const stytchUserId = stytchUser.user_id;
      const userEmail = stytchUser.emails[0]?.email;

      if (!userEmail) {
        return res.status(400).json({
          error: 'Invalid user data',
          message: 'Unable to retrieve user from magic link'
        });
      }

      // Find user in database
      const user = await User.findByEmail(userEmail);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          message: 'No account found with this email'
        });
      }

      // Set session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Create session in database
      const newSession = new Session({
        userId: user._id,
        sessionToken: sessionToken,
        expires: expiresAt,
        ipAddress: req.ip || req.connection.remoteAddress || undefined,
        userAgent: req.headers['user-agent'] || undefined
      });

      await newSession.save();

      // Set cookie
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        path: '/'
      };

      res.cookie('session', sessionToken, cookieOptions);

      return res.status(200).json({
        success: true,
        message: 'Magic link verified successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        stytch: {
          user_id: stytchUserId,
          session_token: verificationResponse.session_token,
          session_jwt: verificationResponse.session_jwt
        }
      });

    } catch (error) {
      console.error('Verify magic link error:', error);

      // Handle Stytch-specific errors
      if (error instanceof Error && 'error_type' in error) {
        return res.status(400).json({
          error: 'Invalid magic link',
          message: 'The magic link is invalid or has expired'
        });
      }

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred during verification'
      });
    }
  }

  static async getUser(req: Request, res: Response) {
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
      }).populate('userId');

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

      const user = session.userId as any;

      // Return information
      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        session: {
          id: session._id,
          token: session.sessionToken,
          expiresAt: session.expires,
          createdAt: session.createdAt,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent
        }
      });

    } catch (error) {
      console.error('Get user error:', error);

      return res.status(500).json({
        error: 'Internal server error',
        message: 'An unexpected error occurred while getting user'
      });
    }
  }
}