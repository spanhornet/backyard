'use client';

// Tanstack React Query
import { useQuery, useQueryClient } from '@tanstack/react-query';

// API Handler
import { apiHandler } from '@/lib/api-handler';

// Types
import type { IUser, ISession } from '@repo/database';

interface GetUserResponse {
  success: boolean;
  user: IUser;
  session: ISession;
}

interface SignOutResponse {
  success: boolean;
  message: string;
}

export function useUser() {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ['user', 'get-user'],
    queryFn: async (): Promise<GetUserResponse> => {
      const response = await apiHandler.get<GetUserResponse>('/api/users/get-user');

      if (response.error) throw new Error(response.error);
      return response.data!;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const signOut = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await apiHandler.post<SignOutResponse>('/api/users/sign-out');

      if (response.error) {
        return { success: false, error: response.error };
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem('session');
      }

      queryClient.setQueryData(['user', 'get-user'], null);
      queryClient.invalidateQueries({ queryKey: ['user', 'get-user'] });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  return { ...userQuery, signOut };
}