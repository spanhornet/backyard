'use client';

// React
import { useEffect } from 'react';

// Next.js
import { useRouter } from 'next/navigation';

// Hooks
import { useUser } from '@/app/(auth)/use-user';

// UI Components
import { Spinner } from '@/components/ui/spinner';

export default function Home() {
  // Set router
  const router = useRouter();

  // Set user
  const { data, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      if (data?.user && data?.session) {
        // Redirect authenticated user
        router.push('/directory');
      } else {
        // Redirect unauthenticated user
        router.push('/sign-in');
      }
    }
  }, [isLoading, data?.user, data?.session, router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
