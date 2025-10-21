// React
import React from 'react';

// UI Components
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Lucide Icons
import {
  Mail as MailIcon,
  Download as DownloadIcon,
  Calendar as CalendarIcon,
  Building2 as Building2Icon,
  GraduationCap as GraduationCapIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
  User as UserIcon
} from 'lucide-react';

// Types
import {
  type IProfile,
  type IEducation,
  type IExperience,
  type IOrganization
} from '@repo/database';

// Actions
import {
  getInitials,
  getUniversityInitial,
  formatDateRange
} from '../actions';

interface ProfileCardProps {
  profile: IProfile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-card text-card-foreground rounded-xl border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex gap-4 items-center">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-medium text-foreground mb-2">{profile.name}</h1>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {profile.class}
              </Badge>
              {profile.house && (
                <Badge variant="outline">
                  {profile.house}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {profile.education && profile.education.length > 0 && (
        <>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCapIcon className="h-5 w-5 text-primary" />
              <h2 className="text-base font-medium text-foreground">Education</h2>
            </div>
            <div className="space-y-4">
              {profile.education.map((edu: IEducation, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {getUniversityInitial(edu.university)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">
                      {edu.university}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.degreeType} in {edu.degreeName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>
                        {formatDateRange(
                          edu.startMonth,
                          edu.startYear,
                          edu.endMonth,
                          edu.endYear,
                          edu.isCurrent
                        )}
                      </span>
                    </div>
                    {edu.description && (
                      <p className="text-xs mt-2 line-clamp-2">
                        {edu.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {profile.experiences && profile.experiences.length > 0 && (
        <>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <BriefcaseIcon className="h-5 w-5 text-primary" />
              <h2 className="text-base font-medium text-foreground">Work Experience</h2>
            </div>
            <div className="space-y-4">
              {profile.experiences.map((exp: IExperience, index: number) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">{exp.position}</h3>
                    <p className="text-sm text-muted-foreground">
                      {exp.company} • {exp.location}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>
                        {formatDateRange(
                          exp.startMonth,
                          exp.startYear,
                          exp.endMonth,
                          exp.endYear,
                          exp.isCurrent
                        )}
                      </span>
                    </div>
                    {exp.description && (
                      <p className="text-xs mt-2 line-clamp-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {profile.organizations && profile.organizations.length > 0 && (
        <>
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-4">
              <UsersIcon className="h-5 w-5 text-primary" />
              <h2 className="text-base font-medium text-foreground">Organizations</h2>
            </div>
            <div className="space-y-3">
              {profile.organizations.map((org: IOrganization, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm">{org.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {org.position}
                    </p>
                    {org.description && (
                      <p className="text-xs mt-1 line-clamp-2">
                        {org.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      <div className="px-6 py-5">
        <div className="flex items-center gap-2 mb-4">
          <UserIcon className="h-5 w-5 text-primary" />
          <h2 className="text-base font-medium text-foreground">Contact</h2>
        </div>
        <div className="flex flex-col gap-2">
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            <MailIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="truncate">{profile.email}</span>
          </a>
          {profile.resume && (
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              <DownloadIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span>{profile.name}'s Resume</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}