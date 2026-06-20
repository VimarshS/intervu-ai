import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  Code2,
  FileText,
  ArrowRight,
  Target,
  Briefcase,
  Trophy,
  TrendingUp,
  Flame,
  Sparkles,
  CheckCircle2,
  Coins,
} from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { ProgressChartWrapper } from "@/components/dashboard/ProgressChartWrapper";
import { UpgradeHandler } from "@/components/dashboard/UpgradeHandler";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select("id, interview_type, company, status, total_score, duration_seconds, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const completedSessions = sessions?.filter((s) => s.status === "completed") ?? [];
  const totalSessions = sessions?.length ?? 0;

  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.total_score ?? 0), 0) /
            completedSessions.length
        )
      : null;

  const bestScore =
    completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.total_score ?? 0))
      : null;

  const isNewUser = totalSessions === 0;
  const isEarlyUser = totalSessions > 0 && totalSessions < 3;
  const { data: creditsData } = await supabase
  .from("profiles")
  .select("free_credits, paid_credits")
  .eq("id", user.id)
  .single();

const totalCredits =
  (creditsData?.free_credits ?? 0) +
  (creditsData?.paid_credits ?? 0);
const isCreditsExhausted = totalCredits === 0;

  const milestoneProgress = Math.min(completedSessions.length, 3);
  const milestonePercent = Math.round((milestoneProgress / 3) * 100);

  const quickActions = [
    {
      title: "Start Mock Interview",
      description: "Practice with an AI interviewer tailored to your role",
      icon: MessageSquare,
      href: "/interview",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      primary: true,
    },
    {
      title: "Coding Practice",
      description: "Solve problems with AI hints and code review",
      icon: Code2,
      href: "/practice",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      primary: false,
    },
    {
      title: "Analyze Resume",
      description: "Get ATS score and predicted interview questions",
      icon: FileText,
      href: "/resume",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      primary: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── CREDITS EXHAUSTED BANNER ─────────────────────── */}
{isCreditsExhausted && (
  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-red-400" />
          <p
            className="font-semibold text-slate-100"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            You have used all your free credits.
          </p>
        </div>
        <p className="text-sm text-slate-400 max-w-lg">
          Upgrade to keep practicing. Your progress and
          history are saved — pick up right where you
          left off.
        </p>
      </div>
      <Button
        asChild
        className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 shrink-0"
      >
        <Link href="/dashboard?upgrade=true">
          Upgrade Plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  </div>
)}

      {/* ── FIRST-TIME USER BANNER ─────────────────────────── */}
      {isNewUser && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <p
                  className="font-semibold text-slate-100"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Welcome to Intervu AI
                  {profile?.full_name
                    ? `, ${profile.full_name.split(" ")[0]}`
                    : ""}
                  .
                </p>
              </div>
              <p className="text-sm text-slate-400 max-w-lg">
                Your dashboard will fill up as you practice. Most
                users feel more confident after just 3 sessions.
                Start with a 10-minute mock interview right now.
              </p>
            </div>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 shrink-0"
            >
              <Link href="/interview">
                Start Your First Interview
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* ── EARLY USER MILESTONE ───────────────────────────── */}
      {isEarlyUser && (
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <p
                className="text-sm font-semibold text-slate-100"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                First milestone: Complete 3 interviews
              </p>
            </div>
            <span className="text-xs text-slate-500">
              {milestoneProgress}/3
            </span>
          </div>
          <Progress
            value={milestonePercent}
            className="h-1.5 bg-slate-800"
          />
          <p className="text-xs text-slate-500">
            Each interview gives you a scored report showing exactly
            what to improve.{" "}
            {3 - milestoneProgress} more to go.
          </p>
        </div>
      )}

      {/* ── HEADER ────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1
            className="text-2xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            {isNewUser
              ? "Let's get you prepared."
              : `Welcome back${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!`}
          </h1>
          <p className="text-slate-400 text-sm">
            {isNewUser
              ? "Pick an interview type below and start practicing."
              : "Ready to practice? Pick up where you left off."}
          </p>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1.5">
          {profile?.target_role && (
            <Badge
              variant="secondary"
              className="text-xs gap-1 bg-slate-800 text-slate-300 border-slate-700"
            >
              <Briefcase className="h-3 w-3" />
              {profile.target_role}
            </Badge>
          )}
          {profile?.target_company && (
            <Badge
              variant="outline"
              className="text-xs gap-1 border-indigo-500/30 text-indigo-400"
            >
              <Target className="h-3 w-3" />
              {profile.target_company}
            </Badge>
          )}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────── */}
      {!isNewUser && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            label="Total Sessions"
            value={totalSessions}
            icon={MessageSquare}
            iconColor="text-indigo-400"
            iconBg="bg-indigo-500/10"
          />
          <StatsCard
            label="Completed"
            value={completedSessions.length}
            icon={Trophy}
            iconColor="text-amber-400"
            iconBg="bg-amber-500/10"
          />
          <StatsCard
            label="Average Score"
            value={averageScore !== null ? `${averageScore}/10` : "—"}
            icon={TrendingUp}
            iconColor="text-emerald-400"
            iconBg="bg-emerald-500/10"
          />
          <StatsCard
            label="Best Score"
            value={bestScore !== null ? `${bestScore}/10` : "—"}
            icon={Flame}
            iconColor="text-rose-400"
            iconBg="bg-rose-500/10"
          />
        </div>
      )}

      {/* ── QUICK ACTIONS ─────────────────────────────────── */}
      <div>
        <h2
          className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3"
          style={{ fontFamily: "var(--font-space-grotesk)" }}
        >
          {isNewUser ? "Where would you like to start?" : "Quick Actions"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            const isPrimary = index === 0;

            return (
              <Card
                key={action.href}
                className={`transition-all hover:shadow-md ${
                  isPrimary && isNewUser
                    ? "border-indigo-500/30 bg-indigo-500/5 ring-1 ring-indigo-500/20"
                    : "border-slate-800 bg-slate-900"
                }`}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${action.bg} flex items-center justify-center mb-2`}
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base text-slate-100">
                      {action.title}
                    </CardTitle>
                    {isPrimary && isNewUser && (
                      <Badge
                        variant="outline"
                        className="text-xs border-indigo-500/30 text-indigo-400"
                      >
                        Start here
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-500">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    asChild
                    variant={isPrimary && isNewUser ? "default" : "ghost"}
                    size="sm"
                    className={
                      isPrimary && isNewUser
                        ? "w-full bg-indigo-600 hover:bg-indigo-500 text-white border-0"
                        : "w-full justify-between text-slate-400 hover:text-slate-200"
                    }
                  >
                    <Link href={action.href}>
                      {isPrimary && isNewUser ? (
                        <>
                          Start Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Get Started
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── PROGRESS CHARTS — only for users with sessions ── */}
      {completedSessions.length >= 2 && <ProgressChartWrapper />}

      {/* ── RECENT SESSIONS ───────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold text-slate-400 uppercase tracking-wide"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Recent Sessions
          </h2>
          {totalSessions > 0 && (
            <Button asChild variant="ghost" size="sm" className="text-slate-500 hover:text-slate-300">
              <Link href="/history">
                View all
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-2">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                interviewType={session.interview_type}
                company={session.company}
                status={session.status}
                score={session.total_score}
                duration={session.duration_seconds}
                createdAt={session.created_at}
              />
            ))}
          </div>
        ) : (
          /* ── NEW USER EMPTY STATE ─────────────────────── */
          <Card className="border-slate-800 bg-slate-900">
            <CardContent className="py-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-slate-600" />
              </div>
              <div className="space-y-1">
                <p
                  className="font-medium text-slate-300"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  No interviews yet — that&apos;s about to change.
                </p>
                <p className="text-sm text-slate-500 max-w-xs">
                  Most users feel more confident after just 3
                  sessions. Your first one takes 10 minutes.
                </p>
              </div>
              <Button
                asChild
                className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2"
              >
                <Link href="/interview">
                  Start a 10-minute behavioral interview
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── PROFILE NUDGE — if incomplete ─────────────────── */}
      {!profile?.target_role && (
        <Card className="border-slate-700 bg-slate-900">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Set your target role
                </p>
                <p className="text-xs text-slate-500">
                  The AI tailors interview questions to your specific
                  role and company
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
            >
              <Link href="/profile/edit">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Complete Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
     {/* Handles ?upgrade=true and ?payment=success params */}
<UpgradeHandler />
    </div>
  );
}