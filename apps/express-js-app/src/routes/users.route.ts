// Express
import { Router, type Router as RouterType } from 'express';

import { UsersController } from '../controllers/users.controller';

const router: RouterType = Router();

/**
 * POST /users/sign-up
 * Sign up endpoint - creates new user if doesn't exist and sends magic link
 * 
 * Responses:
 * - 201: Magic link sent successfully
 * - 400: Invalid request (missing/invalid fields)
 * - 409: User already exists
 * - 500: Internal server error
 */
router.post('/sign-up', UsersController.signUp);

/**
 * POST /users/sign-in
 * Sign in endpoint - checks if user exists and sends magic link
 * 
 * Responses:
 * - 200: Magic link sent successfully
 * - 400: Invalid request (missing/invalid email)
 * - 404: User not found
 * - 500: Internal server error
 */
router.post('/sign-in', UsersController.signIn);

/**
 * POST /users/sign-out
 * Sign out endpoint - invalidates the current user session
 * 
 * Responses:
 * - 200: Successfully signed out
 * - 401: Unauthorized (missing/invalid session token)
 * - 500: Internal server error
 */
router.post('/sign-out', UsersController.signOut);

/**
 * POST /users/verify-magic-link
 * Verify magic link endpoint - verifies the magic link and returns session
 * 
 * Responses:
 * - 200: Magic link verified successfully
 * - 400: Invalid request (missing/invalid fields)
 * - 404: User not found
 * - 500: Internal server error
 */
router.post('/verify-magic-link', UsersController.verifyMagicLink);

/**
 * GET /users/get-user
 * Get current user endpoint - returns user info and session based on session token
 * 
 * Responses:
 * - 200: User and session data returned successfully
 * - 401: Unauthorized (missing/invalid session token)
 * - 404: User or session not found
 * - 500: Internal server error
 */
router.get('/get-user', UsersController.getUser);

export default router;