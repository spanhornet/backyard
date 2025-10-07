import * as stytch from 'stytch';

// Validate required environment variables
const STYTCH_PROJECT_ID = process.env.STYTCH_PROJECT_ID;
const STYTCH_SECRET_TOKEN = process.env.STYTCH_SECRET_TOKEN;

if (!STYTCH_PROJECT_ID) {
  throw new Error('STYTCH_PROJECT_ID environment variable is required but not set');
}

if (!STYTCH_SECRET_TOKEN) {
  throw new Error('STYTCH_SECRET_TOKEN environment variable is required but not set');
}

// Initialize Stytch client
export const stytchClient = new stytch.Client({
  project_id: STYTCH_PROJECT_ID,
  secret: STYTCH_SECRET_TOKEN,
});
