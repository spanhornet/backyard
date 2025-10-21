'use client';

// Tanstack React Query
import { useQuery } from '@tanstack/react-query';

// API Handler
import { apiHandler } from '@/lib/api-handler';

// Types
import type { IProfile } from '@repo/database';

interface GetProfilesResponse {
  success: boolean;
  profiles: IProfile[];
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles', 'all'],
    queryFn: async (): Promise<GetProfilesResponse> => {
      const response = await apiHandler.get<GetProfilesResponse>('/api/profiles');

      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

