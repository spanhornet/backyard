'use client';

// API Handler
import { apiHandler } from '@/lib/api-handler';

// Types
import type { IProfile } from '@repo/database';

// Interfaces
interface GetUserProfileResponse {
  success: boolean;
  profile: IProfile;
}

export async function getUserProfile() {
  const response = await apiHandler.get<GetUserProfileResponse>('/api/profiles/me');

  // If profile doesn't exist (404), return null
  if (response.status === 404) {
    return null;
  }

  // If there's an error, throw it
  if (response.error) {
    throw new Error(response.error);
  }

  // Return the profile data
  return response.data?.profile || null;
}
