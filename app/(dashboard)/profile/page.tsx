import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target, Trophy, MessageSquare, TrendingUp,
  Star, Link as LinkIcon, Pencil, Calendar,
} from "lucide-react";
import Link from "next/link";
import type { ExperienceLevel } from "@/types/database";

const levelLabels: Record<ExperienceLevel, string> = {
  fresher: "Fresher — 0 years",
  junior: "Junior — 1 to 2 years",
  mid: "Mid-level — 3 to 5 years",
  senior: "Senior — 5+ years",
};

function getReadiness(done: number, avg: number | null, best: number | null) {
  if (done === 0) return { score: 0, label: "Complete your first interview", color: "text-slate-400" };
  let s = Math.min(done * 4, 40);
  if (avg !== null) s += Math.round((avg / 10) * 40);
  if (best !== null) s += Math.round((best / 10) * 20);
  s = Math.min(s, 100);
  if (s >= 80) return { score: s, label: "Interview ready", color: "text-emerald-400" };
  if (s >= 60) return { score: s, label: "Getting there — keep practicing", color: "text-indigo-400" };
  if (s >= 40) return { score: s, label: "Building momentum", color: "text-amber-400" };
  if (s >= 20) return { score: s, label: "Early stage — more sessions needed", color: "text-orange-400" };
  return { score: s, label: "Just starting — keep going", color: "text-slate-400" };
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select("id, status, total_score")
    .eq("user_id", user.id);

  const completed = sessions?.filter((s) => s.status === "completed") ?? [];
  const scores = completed.map((s) => s.total_score).filter((s): s is number => s !== null);
  const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const best = scores.length > 0 ? Math.max(...scores) : null;
  const readiness = getReadiness(completed.length, avg, best);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;

  const statItems = [
    { icon: MessageSquare, label: "Total", value: sessions?.length ?? 0, color: "text-indigo-400" },
    { icon: Trophy, label: "Completed", value: completed.length, color: "text-emerald-400" },
    { icon: TrendingUp, label: "Avg Score", value: avg !== null ? `${avg}/10` : "—", color: "text-amber-400" },
    { icon: Star, label: "Best Score", value: best !== null ? `${best}/10` : "—", color: "text-rose-400" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            Profile
          </h1>
          <p className="text-slate-400 text-sm mt-1">Your account overview</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2">
          <Link href="/profile/edit">
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>

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
              {memberSince && (
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Member since {memberSince}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {profile?.experience_level && (
              <Badge variant="secondary" className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                {levelLabels[profile.experience_level as ExperienceLevel]}
              </Badge>
            )}
            {profile?.target_role && (
              <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                {profile.target_role}
              </Badge>
            )}
            {profile?.target_company && (
              <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400">
                <Target className="h-3 w-3 mr-1" />
                {profile.target_company}
              </Badge>
            )}
          </div>

          {profile?.bio && (
            <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
              {profile.bio}
            </p>
          )}

          {(profile?.linkedin_url || profile?.github_url) && (
            <div className="flex items-center gap-4 border-t border-slate-800 pt-4">
              {profile?.linkedin_url && (
                <Link
                  href={profile.linkedin_url}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  LinkedIn
                </Link>
              )}
              {profile?.github_url && (
                <Link
                  href={profile.github_url}
                  target="_blank"
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  GitHub
                </Link>
              )}
            </div>
          )}

          {(profile?.skills ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-800 pt-4">
              {(profile?.skills ?? []).map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs border-slate-700 text-slate-400">
                  {skill}
                </Badge>
              ))}
            </div>
          )}

          {profile?.interview_goal && (
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 mt-2">
              <p className="text-xs text-indigo-400 font-medium mb-1">Your Goal</p>
              <p className="text-sm text-slate-300">{profile.interview_goal}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-100 flex items-center gap-2" style={{ fontFamily: "var(--font-space-grotesk)" }}>
            <Star className="h-4 w-4 text-indigo-400" />
            Interview Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <span className={`text-4xl font-bold ${readiness.color}`} style={{ fontFamily: "var(--font-space-grotesk)" }}>
              {readiness.score}
              <span className="text-lg text-slate-500 font-normal">/100</span>
            </span>
            <span className="text-xs text-slate-500 text-right max-w-[180px]">{readiness.label}</span>
          </div>
          <Progress value={readiness.score} className="h-2 bg-slate-800" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {statItems.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-lg bg-slate-800 border border-slate-700 p-3 text-center">
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className="text-sm font-semibold text-slate-200 mt-0.5" style={{ fontFamily: "var(--font-space-grotesk)" }}>
                    {String(s.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-11">
          <Link href="/interview">Start Interview</Link>
        </Button>
        <Button asChild variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 h-11">
          <Link href="/history">View History</Link>
        </Button>
      </div>

    </div>
  );
}