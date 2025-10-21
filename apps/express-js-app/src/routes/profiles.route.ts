// Express
import { Router, type Router as RouterType } from 'express';

import { ProfilesController, uploadProfileFiles } from '../controllers/profiles.controller';

const router: RouterType = Router();

/**
 * POST /profiles
 * Create a new profile for the authenticated user
 * Content-Type: multipart/form-data
 * 
 * Form fields:
 * - avatar: File (optional) - Image file for profile picture
 * - resume: File (optional) - PDF/DOC file for resume
 * - name: String (required)
 * - email: String (required)
 * - class: String (required)
 * - house: String (optional)
 * - education: JSON string (required)
 * - experiences: JSON string (optional)
 * - organizations: JSON string (optional)
 * 
 * Responses:
 * - 201: Profile created successfully
 * - 400: Invalid request (missing/invalid fields)
 * - 401: Unauthorized (missing/invalid session token)
 * - 409: Profile already exists for this user
 * - 500: Internal server error
 */
router.post('/', uploadProfileFiles, ProfilesController.createProfile);

/**
 * GET /profiles/me
 * Get profile for the authenticated user
 * 
 * Responses:
 * - 200: Profile fetched successfully
 * - 401: Unauthorized (missing/invalid session token)
 * - 404: Profile not found
 * - 500: Internal server error
 */
router.get('/me', ProfilesController.getMyProfile);

/**
 * GET /profiles
 * Get all profiles
 * 
 * Responses:
 * - 200: Profiles fetched successfully
 * - 500: Internal server error
 */
router.get('/', ProfilesController.getAllProfiles);

/**
 * GET /profiles/:userId
 * Get profile by user ID
 * 
 * Responses:
 * - 200: Profile fetched successfully
 * - 400: Invalid user ID
 * - 404: Profile not found
 * - 500: Internal server error
 */
router.get('/:userId', ProfilesController.getProfileByUserId);

/**
 * PUT /profiles
 * Update profile for the authenticated user
 * Content-Type: multipart/form-data
 * 
 * Form fields (all optional):
 * - avatar: File - Image file for profile picture (replaces existing)
 * - resume: File - PDF/DOC file for resume (replaces existing)
 * - name: String
 * - email: String
 * - class: String
 * - house: String
 * - education: JSON string
 * - experiences: JSON string
 * - organizations: JSON string
 * 
 * Responses:
 * - 200: Profile updated successfully
 * - 400: Invalid request (validation error)
 * - 401: Unauthorized (missing/invalid session token)
 * - 404: Profile not found
 * - 500: Internal server error
 */
router.put('/', uploadProfileFiles, ProfilesController.updateProfile);

/**
 * DELETE /profiles
 * Delete profile for the authenticated user
 * 
 * Responses:
 * - 200: Profile deleted successfully
 * - 401: Unauthorized (missing/invalid session token)
 * - 404: Profile not found
 * - 500: Internal server error
 */
router.delete('/', ProfilesController.deleteProfile);

export default router;

