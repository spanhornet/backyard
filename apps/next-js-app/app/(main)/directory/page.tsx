"use client";

// React
import { useEffect, useState } from "react";

// Next.js
import { useRouter } from "next/navigation";

// Lucide Icons
import {
  LogOut as LogOutIcon,
  UserPen as UserPenIcon,
  Search as SearchIcon,
} from "lucide-react";

// Actions
import { getUserProfile } from "./actions";

// Hooks
import { useUser } from "@/app/(auth)/use-user";
import { useProfiles } from "./hooks/use-profiles";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Set search query
  const [searchQuery, setSearchQuery] = useState("");

  // Set profiles
  const {
    data: profilesData,
    isLoading: profilesIsLoading,
    error: profilesError
  } = useProfiles();

  // Filter profiles based on search query
  const filteredProfiles = profilesData?.profiles.filter((profile) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();

    // Search by name
    if (profile.name.toLowerCase().includes(query)) {
      return true;
    }

    // Search by university
    if (profile.education?.some((edu) =>
      edu.university.toLowerCase().includes(query)
    )) {
      return true;
    }

    // Search by company
    if (profile.experiences?.some((exp) =>
      exp.company.toLowerCase().includes(query)
    )) {
      return true;
    }

    return false;
  }) || [];

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

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, university, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

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

        {!profilesError && filteredProfiles.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No profiles found</EmptyTitle>
              <EmptyDescription>
                {searchQuery.trim()
                  ? "No profiles match your search criteria. Try a different search term."
                  : "There are no profiles to display at the moment."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}

        {filteredProfiles.length > 0 && (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredProfiles.map((profile, index) => (
              <div key={index} className="break-inside-avoid mb-6 isolate">
                <ProfileCard profile={profile} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

