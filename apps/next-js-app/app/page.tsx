'use client';

// React
import { useState, useEffect } from 'react';

// Next.js
import { useRouter } from 'next/navigation';

// UI Components
import { useUser } from '@/app/(auth)/use-user';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function Home() {
  // Set router
  const router = useRouter();

  // Set user
  const { data, isLoading, error, signOut } = useUser();

  // Set state
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !data?.user && !data?.session) {
      // Redirect user
      router.push('/sign-in');
    }
  }, [isLoading, data?.user, data?.session, router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();

      // Redirect user
      router.push('/sign-in');
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!data?.user || !data?.session) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const { user, session } = data;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="w-full">
          <CardContent>
            <div className="space-y-4">
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                <code>
                  {JSON.stringify({ user, session }, null, 2)}
                </code>
              </pre>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              variant="default"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full"
            >
              {isSigningOut ? (
                <>
                  <Spinner className="size-4" />
                  Signing Out...
                </>
              ) : (
                'Sign Out'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
