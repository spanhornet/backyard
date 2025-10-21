"use client";

// React
import { useEffect, useState } from "react";

// Next.js
import { useRouter } from "next/navigation";

// Lucide Icons
import {
  LogOut as LogOutIcon,
  UserPen as UserPenIcon,
} from "lucide-react";

// Actions
import { getUserProfile } from "./actions";

// Hooks
import { useUser } from "@/app/(auth)/use-user";
import { useProfiles } from "./hooks/use-profiles";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

// `ProfileCard` Component
import ProfileCard from "./components/profile-card";

export default function DirectoryPage() {
  // Set router
  const router = useRouter();

  // Set user
  const {
    data: userData,
    isLoading: userIsLoading,
    signOut
  } = useUser();

  // Set flags
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [hasProfileLoading, setHasProfileLoading] = useState(true);

  // Set profiles
  const {
    data: profilesData,
    isLoading: profilesIsLoading,
    error: profilesError
  } = useProfiles();

  // Handle redirects
  useEffect(() => {
    async function checkProfile() {
      if (!userIsLoading) {
        // Check if user is authenticated
        if (!userData?.user || !userData?.session) {
          router.push('/sign-in');
          return;
        }

        // Check if user has a profile
        try {
          const profile = await getUserProfile();
          setHasProfile(!!profile);

          if (!profile) {
            router.push('/profile');
          }
        } catch (error) {
          console.error('Error checking profile:', error);
          router.push('/profile');
        } finally {
          setHasProfileLoading(false);
        }
      }
    }

    checkProfile();
  }, [userIsLoading, userData, router]);

  // Handle sign out
  const handleSignOut = async () => {
    const result = await signOut();

    if (result.success) {
      router.push('/sign-in');
    } else {
      console.error('Sign out failed:', result.error);
      // Optionally, you could show a toast notification here
    }
  };

  if (userIsLoading || hasProfileLoading || profilesIsLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <nav className="flex items-center justify-between">
        <h1 className="text-xl font-medium">DSP Alumni Directory</h1>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push('/profile')}>
            <UserPenIcon className="w-4 h-4" />
            Edit profile
          </Button>
          <Button onClick={handleSignOut} variant="outline">
            <LogOutIcon className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </nav>

      <div>
        {profilesError && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Error loading profiles</EmptyTitle>
              <EmptyDescription>
                {profilesError.message || "Failed to load profiles. Please try again."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {profilesData && profilesData.profiles.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No profiles found</EmptyTitle>
              <EmptyDescription>
                There are no profiles to display at the moment.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {profilesData && profilesData.profiles.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {profilesData.profiles.map((profile) => (
              <div key={String(profile._id)} className="break-inside-avoid mb-6 isolate">
                <ProfileCard profile={profile} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

