"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Target, Briefcase } from "lucide-react";
import type { Profile, ExperienceLevel } from "@/types/database";

const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  target_role: z
    .string()
    .min(2, "Please enter your target role")
    .max(100, "Role must be less than 100 characters"),
  target_company: z
    .string()
    .max(100, "Company must be less than 100 characters")
    .optional(),
  experience_level: z.enum(
    ["fresher", "junior", "mid", "senior"] as const
  ),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const experienceLevelLabels: Record<ExperienceLevel, string> = {
  fresher: "Fresher — 0 years",
  junior: "Junior — 1 to 2 years",
  mid: "Mid-level — 3 to 5 years",
  senior: "Senior — 5+ years",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          toast.error("Failed to load profile.");
          return;
        }

        setProfile(data);

        // Populate form with existing values
        reset({
          full_name: data.full_name ?? "",
          target_role: data.target_role ?? "",
          target_company: data.target_company ?? "",
          experience_level:
            (data.experience_level as ExperienceLevel) ?? "fresher",
        });
      } catch {
        toast.error("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [reset]);

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Session expired. Please log in again.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          target_role: data.target_role,
          target_company: data.target_company ?? null,
          experience_level: data.experience_level,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast.error("Failed to save changes.");
        return;
      }

      // Update local state to reflect saved values
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              full_name: data.full_name,
              target_role: data.target_role,
              target_company: data.target_company ?? null,
              experience_level: data.experience_level,
            }
          : prev
      );

      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  }

  // Generate initials for avatar
  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your account and interview preferences
        </p>
      </div>

      {/* Avatar + Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details from sign up
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={profile?.avatar_url ?? ""}
              alt={profile?.full_name ?? "User"}
            />
            <AvatarFallback className="text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="font-medium">
              {profile?.full_name ?? "No name set"}
            </p>
            <p className="text-sm text-muted-foreground">
              {profile?.email}
            </p>
            <Badge variant="secondary" className="text-xs">
              {profile?.experience_level
                ? experienceLevelLabels[profile.experience_level]
                : "Level not set"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Interview Preferences
          </CardTitle>
          <CardDescription>
            These settings personalise your AI interview experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="John Doe"
                disabled={isSaving}
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-destructive text-xs">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            <Separator />

            {/* Target Role */}
            <div className="space-y-2">
              <Label htmlFor="target_role">
                <Briefcase className="h-3.5 w-3.5 inline mr-1" />
                Target Role
              </Label>
              <Input
                id="target_role"
                placeholder="e.g. Software Development Engineer"
                disabled={isSaving}
                {...register("target_role")}
              />
              {errors.target_role && (
                <p className="text-destructive text-xs">
                  {errors.target_role.message}
                </p>
              )}
            </div>

            {/* Target Company */}
            <div className="space-y-2">
              <Label htmlFor="target_company">
                Target Company{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                id="target_company"
                placeholder="e.g. Google, Amazon, any startup..."
                disabled={isSaving}
                {...register("target_company")}
              />
              {errors.target_company && (
                <p className="text-destructive text-xs">
                  {errors.target_company.message}
                </p>
              )}
            </div>

            {/* Experience Level */}
            <div className="space-y-2">
              <Label>Experience Level</Label>
              <Select
                defaultValue={profile?.experience_level ?? undefined}
                onValueChange={(value) =>
                  setValue(
                    "experience_level",
                    value as ExperienceLevel,
                    { shouldDirty: true }
                  )
                }
                disabled={isSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">
                    Fresher — 0 years experience
                  </SelectItem>
                  <SelectItem value="junior">
                    Junior — 1 to 2 years experience
                  </SelectItem>
                  <SelectItem value="mid">
                    Mid-level — 3 to 5 years experience
                  </SelectItem>
                  <SelectItem value="senior">
                    Senior — 5+ years experience
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.experience_level && (
                <p className="text-destructive text-xs">
                  {errors.experience_level.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSaving || !isDirty}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}