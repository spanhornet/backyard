"use client";

// React
import { useState, useEffect } from "react";

// Zod
import { z } from "zod";

// React Hook Form
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";

// Lucide Icons
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Plus as PlusIcon,
  Trash2 as TrashIcon,
  Briefcase as BriefcaseIcon,
  Users as UsersIcon,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// `ResumeUpload` Component
import { ResumeUpload } from "./components/upload.resume";

// `AvatarUpload` Component
import { AvatarUpload } from "./components/upload.avatar";

// Constants
import {
  CLASS_OPTIONS,
  HOUSE_OPTIONS,
  DEGREE_TYPE_OPTIONS,
  MONTH_OPTIONS
} from "./constants";

// Hooks
import { useUser } from "@/app/(auth)/use-user";

// Actions
import { getUserProfile } from "./actions";

// Types
import type { IProfile } from "@repo/database";

// Next.js
import { useRouter } from "next/navigation";

const steps = [1, 2, 3, 4, 5];

const profileFormSchema = z.object({
  name: z.string().min(2, "Please enter a name"),
  email: z.string().email("Please enter a valid email"),
  class: z.string().min(1, "Please select a class"),
  house: z.string().optional(),
  avatar: z.string().nullable().optional(),
  resume: z.any().nullable().optional(),
  education: z.array(z.object({
    university: z.string().min(1, "Please enter a university"),
    degreeName: z.string().min(1, "Please enter a degree name"),
    degreeType: z.string().min(1, "Please select a degree type"),
    startMonth: z.string().min(1, "Please enter a start month"),
    startYear: z.string().min(1, "Please enter a start year"),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().optional(),
  })).min(1, "There must be at least 1 education"),
  experiences: z.array(z.object({
    company: z.string().min(1, "Please enter a company name"),
    location: z.string().min(1, "Please enter a location"),
    position: z.string().min(1, "Please enter a job position"),
    startMonth: z.string().min(1, "Please enter a start month"),
    startYear: z.string().min(1, "Please enter a start year"),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().optional(),
  })),
  organizations: z.array(z.object({
    name: z.string().min(1, "Please enter an organization"),
    position: z.string().min(1, "Please enter a position"),
    startMonth: z.string().min(1, "Please enter a start month"),
    startYear: z.string().min(1, "Please enter a start year"),
    endMonth: z.string().optional(),
    endYear: z.string().optional(),
    isCurrent: z.boolean().optional(),
    description: z.string().optional(),
  })),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [existingProfile, setExistingProfile] = useState<IProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const router = useRouter();

  // Get user
  const { data } = useUser();

  // Form setup
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: data?.user?.name || "",
      email: data?.user?.email || "",
      class: "",
      house: "",
      avatar: null,
      resume: null,
      education: [{
        university: "",
        degreeName: "",
        degreeType: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        isCurrent: false,
        description: "",
      }],
      experiences: [],
      organizations: [],
    },
  });

  // `Education` field array
  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control: form.control,
    name: "education",
  });

  // `Experiences` field array
  const {
    fields: experiencesFields,
    append: appendExperience,
    remove: removeExperience
  } = useFieldArray({
    control: form.control,
    name: "experiences",
  });

  // `Organizations` field array
  const {
    fields: organizationsFields,
    append: appendOrganization,
    remove: removeOrganization
  } = useFieldArray({
    control: form.control,
    name: "organizations",
  });

  // Fetch existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoadingProfile(true);
        const profile = await getUserProfile();
        setExistingProfile(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (data?.user) {
      form.setValue("name", data.user.name || "");
      form.setValue("email", data.user.email || "");
    }

    // Prepopulate with existing profile data
    if (existingProfile) {
      form.setValue("class", existingProfile.class || "");
      form.setValue("house", existingProfile.house || "");
      form.setValue("avatar", existingProfile.avatar || null);
      form.setValue("resume", existingProfile.resume || null);

      if (existingProfile.education && existingProfile.education.length > 0) {
        form.setValue("education", existingProfile.education.map(edu => ({
          university: edu.university || "",
          degreeName: edu.degreeName || "",
          degreeType: edu.degreeType || "",
          startMonth: edu.startMonth || "",
          startYear: edu.startYear || "",
          endMonth: edu.endMonth || "",
          endYear: edu.endYear || "",
          isCurrent: edu.isCurrent || false,
          description: edu.description || "",
        })));
      }

      if (existingProfile.experiences && existingProfile.experiences.length > 0) {
        form.setValue("experiences", existingProfile.experiences.map(exp => ({
          company: exp.company || "",
          location: exp.location || "",
          position: exp.position || "",
          startMonth: exp.startMonth || "",
          startYear: exp.startYear || "",
          endMonth: exp.endMonth || "",
          endYear: exp.endYear || "",
          isCurrent: exp.isCurrent || false,
          description: exp.description || "",
        })));
      }

      if (existingProfile.organizations && existingProfile.organizations.length > 0) {
        form.setValue("organizations", existingProfile.organizations.map(org => ({
          name: org.name || "",
          position: org.position || "",
          startMonth: org.startMonth || "",
          startYear: org.startYear || "",
          endMonth: org.endMonth || "",
          endYear: org.endYear || "",
          isCurrent: org.isCurrent || false,
          description: org.description || "",
        })));
      }
    }
  }, [data, existingProfile, form]);

  const handleAddEducation = () => {
    appendEducation({
      university: "",
      degreeName: "",
      degreeType: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isCurrent: false,
      description: "",
    });
  };

  const handleAddExperience = () => {
    appendExperience({
      company: "",
      location: "",
      position: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isCurrent: false,
      description: "",
    });
  };

  const handleAddOrganization = () => {
    appendOrganization({
      name: "",
      position: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isCurrent: false,
      description: "",
    });
  };

  const validateStep = async (step: number) => {
    if (step === 1) {
      return await form.trigger(["name", "email", "class"]);
    }

    if (step === 2) {
      if (educationFields.length === 0) {
        return await form.trigger(["education"]);
      }
      const fieldNames: string[] = [];
      educationFields.forEach((_, i) => {
        fieldNames.push(
          `education.${i}.university`,
          `education.${i}.degreeName`,
          `education.${i}.degreeType`,
          `education.${i}.startMonth`,
          `education.${i}.startYear`,
        );
      });
      return await form.trigger(fieldNames as any);
    }

    if (step === 3) {
      if (experiencesFields.length === 0) return true;
      const fieldNames: string[] = [];
      experiencesFields.forEach((_, i) => {
        fieldNames.push(
          `experiences.${i}.company`,
          `experiences.${i}.location`,
          `experiences.${i}.position`,
          `experiences.${i}.startMonth`,
          `experiences.${i}.startYear`,
        );
      });
      return await form.trigger(fieldNames as any);
    }

    if (step === 4) {
      if (organizationsFields.length === 0) return true;
      const fieldNames: string[] = [];
      organizationsFields.forEach((_, i) => {
        fieldNames.push(
          `organizations.${i}.name`,
          `organizations.${i}.position`,
          `organizations.${i}.startMonth`,
          `organizations.${i}.startYear`,
        );
      });
      return await form.trigger(fieldNames as any);
    }
    return true;
  };

  const handleSubmit = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const formData = form.getValues();
    const isUpdate = !!existingProfile;

    try {
      // Create form data for file uploads
      const formDataToSend = new FormData();

      // Append text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('class', formData.class);
      if (formData.house) formDataToSend.append('house', formData.house);

      // Append complex objects as JSON strings
      formDataToSend.append('education', JSON.stringify(formData.education));
      formDataToSend.append('experiences', JSON.stringify(formData.experiences));
      formDataToSend.append('organizations', JSON.stringify(formData.organizations));

      // Handle avatar
      if (formData.avatar) {
        if (formData.avatar.startsWith('blob:')) {
          try {
            const response = await fetch(formData.avatar);
            const blob = await response.blob();
            const avatarFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
            formDataToSend.append('avatar', avatarFile);
          } catch (error) {
            console.error('Failed to process avatar:', error);
          }
        }
      }

      // Handle resume
      if (formData.resume && formData.resume instanceof File) {
        formDataToSend.append('resume', formData.resume);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/profiles`, {
        method: isUpdate ? 'PUT' : 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/directory');
      } else {
        alert(`Error: ${result.message || `Failed to ${isUpdate ? 'update' : 'create'} profile`}`);
        console.error(`Error ${isUpdate ? 'updating' : 'creating'} profile:`, result);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert(`Failed to ${isUpdate ? 'update' : 'create'} profile. Please try again.`);
    }
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);
    if (!valid) return;
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <Form {...form}>
      <div className="w-full space-y-10 max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex justify-center w-full">
          <Stepper value={currentStep} onValueChange={async (next) => {
            if (next > currentStep) {
              const valid = await validateStep(currentStep);
              if (!valid) return;
            }
            setCurrentStep(next);
          }}>
            {steps.map((step) => (
              <StepperItem key={step} step={step} className="not-last:flex-1">
                <StepperTrigger asChild>
                  <StepperIndicator />
                </StepperTrigger>
                {step < steps.length && <StepperSeparator />}
              </StepperItem>
            ))}
          </Stepper>
        </div>

        <div className="min-h-[300px] flex items-center justify-center">
          {currentStep === 1 && (
            <div className="w-full mx-auto space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headshot</FormLabel>
                      <FormControl>
                        <AvatarUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          placeholder="Enter your name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled
                          type="email"
                          placeholder="Enter your email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CLASS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="house"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your house" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HOUSE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume</FormLabel>
                      <FormControl>
                        <ResumeUpload
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="w-full space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Education</h2>
                <p className="text-muted-foreground text-sm">Add your education history. You can add multiple entries.</p>
              </div>
              <div className="space-y-6">
                {educationFields.map((field, index) => (
                  <div key={field.id} className="space-y-4">
                    {index > 0 && <Separator className="my-6" />}

                    <FormField
                      control={form.control}
                      name={`education.${index}.university`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>University</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter your university"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.degreeName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field of Study</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              placeholder="Enter your field of study"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`education.${index}.degreeType`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Degree</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select your degree" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DEGREE_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`education.${index}.isCurrent`}
                        render={({ field }) => (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(!!checked);
                                if (checked) {
                                  form.setValue(`education.${index}.endMonth`, "");
                                  form.setValue(`education.${index}.endYear`, "");
                                }
                              }}
                            />
                            <span className="text-sm">I am currently pursuing this degree</span>
                          </div>
                        )}
                      />

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <FormLabel>Start Date</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`education.${index}.startMonth`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Month" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {MONTH_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`education.${index}.startYear`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Year"
                                      min="1900"
                                      max={new Date().getFullYear()}
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <FormLabel>End Date</FormLabel>
                          <div className="grid grid-cols-2 gap-2">
                            <FormField
                              control={form.control}
                              name={`education.${index}.endMonth`}
                              render={({ field }) => (
                                <FormItem>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger className="w-full" disabled={!!form.watch(`education.${index}.isCurrent`)}>
                                        <SelectValue placeholder="Month" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {MONTH_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                          {option.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`education.${index}.endYear`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="Year"
                                      min="1900"
                                      max={new Date().getFullYear() + 10}
                                      {...field}
                                      disabled={!!form.watch(`education.${index}.isCurrent`)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name={`education.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any additional information"
                              className="min-h-20"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {index > 0 && (
                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeEducation(index)}
                        >
                          Remove education
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEducation}
                  className="w-full"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Education
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="w-full space-y-6">
              {experiencesFields.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BriefcaseIcon className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Experiences Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add your work experiences to your profile, or skip this step if you prefer.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddExperience}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Experience
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Work Experience</h2>
                    <p className="text-muted-foreground text-sm">List your most recent roles first. Add as many as needed.</p>
                  </div>
                  {experiencesFields.map((field, index) => (
                    <div key={field.id} className="space-y-4">
                      {index > 0 && <Separator className="my-6" />}

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.company`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter a company"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter a location"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.position`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="Enter your position"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name={`experiences.${index}.isCurrent`}
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={!!field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(!!checked);
                                  if (checked) {
                                    form.setValue(`experiences.${index}.endMonth`, "");
                                    form.setValue(`experiences.${index}.endYear`, "");
                                  }
                                }}
                              />
                              <span className="text-sm">I am currently working in this role</span>
                            </div>
                          )}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <FormLabel>Start Date</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.startMonth`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full">
                                          <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {MONTH_OPTIONS.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`experiences.${index}.startYear`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Year"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <FormLabel>End Date</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                              <FormField
                                control={form.control}
                                name={`experiences.${index}.endMonth`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="w-full" disabled={!!form.watch(`experiences.${index}.isCurrent`)}>
                                          <SelectValue placeholder="Month" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {MONTH_OPTIONS.map((option) => (
                                          <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`experiences.${index}.endYear`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="Year"
                                        min="1900"
                                        max={new Date().getFullYear() + 10}
                                        {...field}
                                        disabled={!!form.watch(`experiences.${index}.isCurrent`)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name={`experiences.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add any additional information"
                                className="min-h-20"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeExperience(index)}
                        >
                          Remove experience
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddExperience}
                    className="w-full"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Experience
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="w-full space-y-6">
              <div className="space-y-6">
                {organizationsFields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <UsersIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Organizations Yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Add your organizations to your profile, or skip this step if you prefer.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddOrganization}
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Organization
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h2 className="text-xl font-semibold">Organizations</h2>
                      <p className="text-muted-foreground text-sm">Include organizations you’ve been part of.</p>
                    </div>
                    {organizationsFields.map((field, index) => (
                      <div key={field.id} className="space-y-4">
                        {index > 0 && <Separator className="my-6" />}

                        <FormField
                          control={form.control}
                          name={`organizations.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organization</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Enter an organization"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`organizations.${index}.position`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Position</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder="Enter your position"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name={`organizations.${index}.isCurrent`}
                            render={({ field }) => (
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={!!field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(!!checked);
                                    if (checked) {
                                      form.setValue(`organizations.${index}.endMonth`, "");
                                      form.setValue(`organizations.${index}.endYear`, "");
                                    }
                                  }}
                                />
                                <span className="text-sm">I am currently in this organization</span>
                              </div>
                            )}
                          />

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <FormLabel>Start Date</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name={`organizations.${index}.startMonth`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Month" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {MONTH_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`organizations.${index}.startYear`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Year"
                                          min="1900"
                                          max={new Date().getFullYear()}
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <FormLabel>End Date</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name={`organizations.${index}.endMonth`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger className="w-full" disabled={!!form.watch(`organizations.${index}.isCurrent`)}>
                                            <SelectValue placeholder="Month" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {MONTH_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                              {option.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name={`organizations.${index}.endYear`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          type="number"
                                          placeholder="Year"
                                          min="1900"
                                          max={new Date().getFullYear() + 10}
                                          {...field}
                                          disabled={!!form.watch(`organizations.${index}.isCurrent`)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name={`organizations.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Add any additional information"
                                  className="min-h-20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end pt-2">
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeOrganization(index)}
                          >
                            Remove organization
                          </Button>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {organizationsFields.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOrganization}
                    className="w-full"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Organization
                  </Button>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="w-full space-y-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Confirmation</h2>
                  <p className="text-muted-foreground text-sm">Please confirm everything looks correct before submitting.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Basic</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                    <div className="flex items-baseline justify-between md:block">
                      <p className="text-xs text-muted-foreground">Headshot</p>
                      {form.watch("avatar") ? (
                        <img
                          src={form.watch("avatar") as string}
                          alt="Headshot preview"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <p className="font-medium">Not uploaded</p>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between md:block">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="font-medium">{form.watch("name")}</p>
                    </div>
                    <div className="flex items-baseline justify-between md:block">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{form.watch("email")}</p>
                    </div>
                    <div className="flex items-baseline justify-between md:block">
                      <p className="text-xs text-muted-foreground">Class</p>
                      <p className="font-medium">{CLASS_OPTIONS.find(opt => opt.value === form.watch("class"))?.label || "-"}</p>
                    </div>
                    <div className="flex items-baseline justify-between md:block">
                      <p className="text-xs text-muted-foreground">House</p>
                      <p className="font-medium">{HOUSE_OPTIONS.find(opt => opt.value === form.watch("house"))?.label || "-"}</p>
                    </div>
                    <div className="flex items-baseline justify-between md:block">
                      <p className="text-xs text-muted-foreground">Resume</p>
                      <p className="font-medium">{form.watch("resume") ? "Uploaded" : "Not uploaded"}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Education</h3>
                  <div className="space-y-4">
                    {form.watch("education").map((edu, index) => (
                      <div key={index} className="space-y-1">
                        {index > 0 && <Separator className="my-4" />}
                        <div className="flex flex-col gap-1">
                          <p className="font-medium">{edu.university || "-"}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.degreeName || "-"} • {DEGREE_TYPE_OPTIONS.find(opt => opt.value === edu.degreeType)?.label || "-"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {edu.startMonth && edu.startYear ? `${MONTH_OPTIONS.find(m => m.value === edu.startMonth)?.label || ""} ${edu.startYear}` : "-"}
                            {" – "}
                            {edu.endMonth && edu.endYear ? `${MONTH_OPTIONS.find(m => m.value === edu.endMonth)?.label || ""} ${edu.endYear}` : "Present"}
                          </p>
                          {edu.description && (
                            <p className="text-sm">{edu.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {form.watch("experiences").length > 0 && (
                  <div className="space-y-3">
                    <Separator className="my-6" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Work experience</h3>
                    <div className="space-y-4">
                      {form.watch("experiences").map((exp, index) => (
                        <div key={index} className="space-y-1">
                          {index > 0 && <Separator className="my-4" />}
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">{exp.company || "-"}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.position || "-"} • {exp.location || "-"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {exp.startMonth && exp.startYear ? `${MONTH_OPTIONS.find(m => m.value === exp.startMonth)?.label || ""} ${exp.startYear}` : "-"}
                              {" – "}
                              {exp.endMonth && exp.endYear ? `${MONTH_OPTIONS.find(m => m.value === exp.endMonth)?.label || ""} ${exp.endYear}` : "Present"}
                            </p>
                            {exp.description && (
                              <p className="text-sm">{exp.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {form.watch("organizations").length > 0 && (
                  <div className="space-y-3">
                    <Separator className="my-6" />
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Organizations</h3>
                    <div className="space-y-4">
                      {form.watch("organizations").map((org, index) => (
                        <div key={index} className="space-y-1">
                          {index > 0 && <Separator className="my-4" />}
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">{org.name || "-"}</p>
                            <p className="text-sm text-muted-foreground">
                              {org.position || "-"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {org.startMonth && org.startYear ? `${MONTH_OPTIONS.find(m => m.value === org.startMonth)?.label || ""} ${org.startYear}` : "-"}
                              {" – "}
                              {org.endMonth && org.endYear ? `${MONTH_OPTIONS.find(m => m.value === org.endMonth)?.label || ""} ${org.endYear}` : "Present"}
                            </p>
                            {org.description && (
                              <p className="text-sm">{org.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
}