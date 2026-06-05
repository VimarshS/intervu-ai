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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  User,
  Target,
  Briefcase,
  Trophy,
  MessageSquare,
  TrendingUp,
  Star,
  Trash2,
  KeyRound,
  Plus,
  X,
  AlertTriangle,
  Link as LinkIcon,
} from "lucide-react";
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

const levelLabels: Record<ExperienceLevel, string> = {
  fresher: "Fresher — 0 years",
  junior: "Junior — 1 to 2 years",
  mid: "Mid-level — 3 to 5 years",
  senior: "Senior — 5+ years",
};

export default function ProfilePage() {
  const router = useRouter();
  const { profile, stats, isLoading, updateProfile, changePassword, deleteAccount } = useProfile();
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

  const { register: regPwd, handleSubmit: handlePwdSubmit, reset: resetPwd, formState: { errors: pwdErrors } } = useForm<PasswordFormData>({
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
    if (error) toast.error(error);
    else toast.success("Profile updated successfully");
    setIsSaving(false);
  }

  async function onPwdSubmit(data: PasswordFormData) {
    setIsChangingPassword(true);
    const { error } = await changePassword(data.new_password);
    if (error) toast.error(error);
    else { toast.success("Password changed"); resetPwd(); setShowPasswordForm(false); }
    setIsChangingPassword(false);
  }

  async function onDeleteAccount() {
    setIsDeletingAccount(true);
    const { error } = await deleteAccount();
    if (error) { toast.error(error); setIsDeletingAccount(false); }
    else { toast.success("Account deleted"); router.push("/"); }
  }

  function addSkill() {
    const t = skillInput.trim();
    if (!t || skills.includes(t)) return;
    setSkills((p) => [...p, t]);
    setSkillInput("");
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-50" style={{ fontFamily: "var(--font-space-grotesk)" }}>
          Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and interview preparation settings</p>
      </div>

      {/* Profile Header */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-slate-700">
              <AvatarImage src={profile?.avatar_url ?? ""} alt={profile?.full_name ?? "User"} />
              <AvatarFallback className="text-xl font-bold bg-indigo-500/20 text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-100 truncate" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {profile?.full_name ?? "User"}
              </h2>
              <p className="text-sm text-slate-400 truncate">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {profile?.experience_level && (
                  <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                    {levelLabels[profile.experience_level as ExperienceLevel]}
                  </Badge>
                )}
                {profile?.target_company && (
                  <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">
                    <Target className="h-3 w-3 mr-1" />
                    {profile.target_company}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {profile?.bio && (
            <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
              {profile.bio}
            </p>
          )}

          {(profile?.linkedin_url || profile?.github_url) && (
            <div className="flex items-center gap-4 border-t border-slate-800 pt-4">
              {profile?.linkedin_url && (
                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                  <LinkIcon className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              )}
              {profile?.github_url && (
                <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors">
                  <LinkIcon className="h-3.5 w-3.5" />
                  GitHub
                </a>
              )}
            </div>
          )}

          {(profile?.skills ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(profile?.skills ?? []).map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs border-slate-700 text-slate-400">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Readiness */}
      {stats && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-slate-100 flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
              <Star className="h-4 w-4 text-indigo-400" />
              Interview Readiness
            </CardTitle>
            <CardDescription className="text-slate-500">Based on your practice sessions and scores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <span className={`text-4xl font-bold ${stats.readinessColor}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
                {stats.readinessScore}
                <span className="text-lg text-slate-500 font-normal">/100</span>
              </span>
              <span className="text-xs text-slate-500 text-right max-w-[200px]">{stats.readinessLabel}</span>
            </div>
            <Progress value={stats.readinessScore} className="h-2 bg-slate-800" />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { icon: MessageSquare, label: "Total", value: stats.totalSessions, color: "text-indigo-400" },
                { icon: Trophy, label: "Completed", value: stats.completedSessions, color: "text-emerald-400" },
                { icon: TrendingUp, label: "Avg Score", value: stats.averageScore !== null ? `${stats.averageScore}/10` : "—", color: "text-amber-400" },
                { icon: Star, label: "Best Score", value: stats.bestScore !== null ? `${stats.bestScore}/10` : "—", color: "text-rose-400" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-center">
                    <Icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-sm font-semibold text-slate-200 mt-0.5" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                      {s.value}
                    </p>
                  </div>
                );
              })}
            </div>

            {profile?.interview_goal && (
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                <p className="text-xs text-indigo-400 font-medium mb-1">Your Goal</p>
                <p className="text-sm text-slate-300">{profile.interview_goal}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Profile */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-base text-slate-100 flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <Briefcase className="h-4 w-4 text-indigo-400" />
            Interview Preferences
          </CardTitle>
          <CardDescription className="text-slate-500">Personalise your AI interview experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">Full Name</Label>
              <Input placeholder="John Doe" disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("full_name")} />
              {errors.full_name && <p className="text-red-400 text-xs">{errors.full_name.message}</p>}
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">Target Role</Label>
              <Input placeholder="e.g. Software Development Engineer" disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("target_role")} />
              {errors.target_role && <p className="text-red-400 text-xs">{errors.target_role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Target Company <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <Input placeholder="e.g. Google, Amazon..." disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("target_company")} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">Experience Level</Label>
              <Select defaultValue={profile?.experience_level ?? "fresher"}
                onValueChange={(v) => setValue("experience_level", v as ExperienceLevel, { shouldDirty: true })}
                disabled={isSaving}>
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
                Interview Goal <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <Input placeholder="e.g. Get into FAANG by December 2026" disabled={isSaving}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                {...register("interview_goal")} />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Bio <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <Textarea placeholder="Tell us a bit about yourself..." disabled={isSaving} rows={3}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 resize-none"
                {...register("bio")} />
              {errors.bio && <p className="text-red-400 text-xs">{errors.bio.message}</p>}
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-2">
              <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                Skills <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="e.g. React, Python, SQL..." disabled={isSaving}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500" />
                <Button type="button" variant="outline" size="icon" onClick={addSkill}
                  disabled={isSaving || !skillInput.trim()}
                  className="border-slate-700 hover:bg-slate-800 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {skills.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs border-slate-700 text-slate-300 gap-1 pr-1">
                      {skill}
                      <button type="button" onClick={() => setSkills((p) => p.filter((s) => s !== skill))}
                        className="hover:text-red-400 transition-colors">
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
                Social Links <span className="text-slate-500 normal-case font-normal">(optional)</span>
              </Label>
              <div className="flex items-center gap-3">
                <LinkIcon className="h-4 w-4 text-slate-500 shrink-0" />
                <Input placeholder="https://linkedin.com/in/yourprofile" disabled={isSaving}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("linkedin_url")} />
              </div>
              {errors.linkedin_url && <p className="text-red-400 text-xs ml-7">{errors.linkedin_url.message}</p>}
              <div className="flex items-center gap-3">
                <LinkIcon className="h-4 w-4 text-slate-500 shrink-0" />
                <Input placeholder="https://github.com/yourusername" disabled={isSaving}
                  className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  {...register("github_url")} />
              </div>
              {errors.github_url && <p className="text-red-400 text-xs ml-7">{errors.github_url.message}</p>}
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
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
          <CardTitle className="text-base text-slate-100 flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <User className="h-4 w-4 text-indigo-400" />
            Account Settings
          </CardTitle>
          <CardDescription className="text-slate-500">Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300 text-xs font-medium uppercase tracking-wide">Email Address</Label>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
              <span className="text-sm text-slate-300">{profile?.email}</span>
              <Badge variant="secondary" className="ml-auto text-xs bg-slate-700 text-slate-400">Cannot change</Badge>
            </div>
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Password</p>
                <p className="text-xs text-slate-500">Change your account password</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                {showPasswordForm ? "Cancel" : "Change"}
              </Button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePwdSubmit(onPwdSubmit)} className="space-y-3 pt-2">
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">New Password</Label>
                  <Input type="password" placeholder="••••••••"
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    {...regPwd("new_password")} />
                  {pwdErrors.new_password && <p className="text-red-400 text-xs">{pwdErrors.new_password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 text-xs">Confirm Password</Label>
                  <Input type="password" placeholder="••••••••"
                    className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    {...regPwd("confirm_password")} />
                  {pwdErrors.confirm_password && <p className="text-red-400 text-xs">{pwdErrors.confirm_password.message}</p>}
                </div>
                <Button type="submit" size="sm" disabled={isChangingPassword}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white border-0">
                  {isChangingPassword && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  {isChangingPassword ? "Changing..." : "Update Password"}
                </Button>
              </form>
            )}
          </div>

          <Separator className="bg-slate-800" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-400">Delete Account</p>
                <p className="text-xs text-slate-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
            {showDeleteConfirm && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300">Are you absolutely sure?</p>
                    <p className="text-xs text-red-400/70 mt-1">
                      This will permanently delete your account, all interview sessions,
                      feedback reports, and resume analyses. This cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    Cancel
                  </Button>
                  <Button size="sm" onClick={onDeleteAccount} disabled={isDeletingAccount}
                    className="bg-red-600 hover:bg-red-500 text-white border-0">
                    {isDeletingAccount && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
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