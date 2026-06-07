"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  User,
  Briefcase,
  Trash2,
  KeyRound,
  Plus,
  X,
  AlertTriangle,
  Link as LinkIcon,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { ExperienceLevel } from "@/types/database";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(50),
  target_role: z.string().min(2, "Please enter your target role").max(100),
  target_company: z.string().max(100).optional(),
  experience_level: z.enum(["fresher", "junior", "mid", "senior"] as const),
  linkedin_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  github_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  bio: z.string().max(300, "Bio must be under 300 characters").optional(),
  interview_goal: z.string().max(200, "Goal must be under 200 characters").optional(),
});

const passwordSchema = z.object({
  new_password: z.string().min(6, "Password must be at least 6 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function EditProfilePage() {
  const router = useRouter();
  const { profile, isLoading, updateProfile, changePassword, deleteAccount } = useProfile();

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(profile?.skills ?? []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      full_name: profile?.full_name ?? "",
      target_role: profile?.target_role ?? "",
      target_company: profile?.target_company ?? "",
      experience_level: (profile?.experience_level as ExperienceLevel) ?? "fresher",
      linkedin_url: profile?.linkedin_url ?? "",
      github_url: profile?.github_url ?? "",
      bio: profile?.bio ?? "",
      interview_goal: profile?.interview_goal ?? "",
    },
  });

  const {
    register: regPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  async function onSubmit(data: ProfileFormData) {
    setIsSaving(true);
    const { error } = await updateProfile({
      full_name: data.full_name,
      target_role: data.target_role,
      target_company: data.target_company ?? null,
      experience_level: data.experience_level as ExperienceLevel,
      linkedin_url: data.linkedin_url || null,
      github_url: data.github_url || null,
      bio: data.bio || null,
      skills,
      interview_goal: data.interview_goal || null,
    });
    if (error) {
      toast.error(error);
    } else {
      toast.success("Profile updated successfully");
      router.push("/profile");
    }
    setIsSaving(false);
  }

  async function onPwdSubmit(data: PasswordFormData) {
    setIsChangingPassword(true);
    const { error } = await changePassword(data.new_password);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Password changed successfully");
      resetPwd();
      setShowPasswordForm(false);
    }
    setIsChangingPassword(false);
  }

  async function onDeleteAccount() {
    setIsDeletingAccount(true);
    const { error } = await deleteAccount();
    if (error) {
      toast.error(error);
      setIsDeletingAccount(false);
    } else {
      toast.success("Account deleted");
      router.push("/");
    }
  }

  function addSkill() {
    const t = skillInput.trim();
    if (!t || skills.includes(t)) return;
    setSkills((p) => [...p, t]);
    setSkillInput("");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
        >
          <Link href="/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1
            className="text-2xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Edit Profile
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Update your interview preparation settings
          </p>
        </div>
      </div>

      {/* Interview Preferences */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle
            className="text-base text-slate-100 flex items-center gap-2"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <Briefcase className="h-4 w-4 text-indigo-400" />
            Interview Preferences
          </CardTitle>
          <CardDescription className="text-slate-500">
            Personalise your AI interview experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Full Name
              </Label>
              <Input
                placeholder="John Doe"
                disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("full_name")}
              />
              {errors.full_name && (
                <p className="text-red-400 text-xs">{errors.full_name.message}</p>
              )}
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Target Role
              </Label>
              <Input
                placeholder="e.g. Software Development Engineer"
                disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("target_role")}
              />
              {errors.target_role && (
                <p className="text-red-400 text-xs">{errors.target_role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Target Company{" "}
                <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. Google, Amazon..."
                disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("target_company")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Experience Level
              </Label>
              <Select
                defaultValue={profile?.experience_level ?? "fresher"}
                onValueChange={(v) =>
                  setValue("experience_level", v as ExperienceLevel, { shouldDirty: true })
                }
                disabled={isSaving}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="fresher" className="text-slate-100">Fresher — 0 years</SelectItem>
                  <SelectItem value="junior" className="text-slate-100">Junior — 1 to 2 years</SelectItem>
                  <SelectItem value="mid" className="text-slate-100">Mid-level — 3 to 5 years</SelectItem>
                  <SelectItem value="senior" className="text-slate-100">Senior — 5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Interview Goal{" "}
                <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <Input
                placeholder="e.g. Get into FAANG by December 2026"
                disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("interview_goal")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Bio{" "}
                <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <Textarea
                placeholder="Tell us a bit about yourself..."
                disabled={isSaving}
                rows={3}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                {...register("bio")}
              />
              {errors.bio && (
                <p className="text-red-400 text-xs">{errors.bio.message}</p>
              )}
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Skills{" "}
                <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                  }}
                  placeholder="e.g. React, Python, SQL..."
                  disabled={isSaving}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addSkill}
                  disabled={isSaving || !skillInput.trim()}
                  className="border-slate-700 hover:bg-slate-800 shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="text-xs border-slate-700 text-slate-300 gap-1 pr-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => setSkills((p) => p.filter((s) => s !== skill))}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-3">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Social Links{" "}
                <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <div className="flex items-center gap-3">
                <LinkIcon className="h-4 w-4 text-slate-500 shrink-0" />
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={isSaving}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("linkedin_url")}
                />
              </div>
              {errors.linkedin_url && (
                <p className="text-red-400 text-xs ml-7">{errors.linkedin_url.message}</p>
              )}
              <div className="flex items-center gap-3">
                <LinkIcon className="h-4 w-4 text-slate-500 shrink-0" />
                <Input
                  placeholder="https://github.com/yourusername"
                  disabled={isSaving}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("github_url")}
                />
              </div>
              {errors.github_url && (
                <p className="text-red-400 text-xs ml-7">{errors.github_url.message}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/profile")}
                disabled={isSaving}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle
            className="text-base text-slate-100 flex items-center gap-2"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            <User className="h-4 w-4 text-indigo-400" />
            Account Settings
          </CardTitle>
          <CardDescription className="text-slate-500">
            Manage your account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
              Email Address
            </Label>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="text-sm text-slate-300">{profile?.email}</span>
              <Badge
                variant="secondary"
                className="ml-auto text-xs bg-slate-700 text-slate-400"
              >
                Cannot change
              </Badge>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          {/* Change Password */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Password</p>
                <p className="text-xs text-slate-500">Change your account password</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                {showPasswordForm ? "Cancel" : "Change"}
              </Button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    {...regPwd("new_password")}
                  />
                  {pwdErrors.new_password && (
                    <p className="text-red-400 text-xs">{pwdErrors.new_password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    {...regPwd("confirm_password")}
                  />
                  {pwdErrors.confirm_password && (
                    <p className="text-red-400 text-xs">{pwdErrors.confirm_password.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isChangingPassword}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                >
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  )}
                  {isChangingPassword ? "Changing..." : "Update Password"}
                </Button>
              </form>
            )}
          </div>

          <Separator className="bg-slate-800" />

          {/* Delete Account */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">Delete Account</p>
                <p className="text-xs text-slate-500">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>

            {showDeleteConfirm && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Are you absolutely sure?
                    </p>
                    <p className="text-xs text-red-400/70 mt-1">
                      This will permanently delete your account, all interview
                      sessions, feedback reports, and resume analyses. This
                      cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={onDeleteAccount}
                    disabled={isDeletingAccount}
                    className="bg-red-600 hover:bg-red-500 text-white border-0"
                  >
                    {isDeletingAccount && (
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    )}
                    {isDeletingAccount ? "Deleting..." : "Yes, Delete Everything"}
                  </Button>
                </div>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

    </div>
  );
}