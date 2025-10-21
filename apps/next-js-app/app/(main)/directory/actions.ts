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

// Helper Functions
export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getUniversityInitial = (university: string) => {
  const words = university.split(' ');
  if (words.length === 1) {
    return university.slice(0, 2).toUpperCase();
  }
  return words
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatDateRange = (
  startMonth?: string,
  startYear?: string,
  endMonth?: string,
  endYear?: string,
  isCurrent?: boolean
) => {
  if (!startMonth || !startYear) return '';
  const start = `${startMonth} ${startYear}`;
  if (isCurrent) return `${start} - Present`;
  if (endMonth && endYear) return `${start} - ${endMonth} ${endYear}`;
  return start;
};

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
