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
import {
  MessageSquare,
  Code2,
  FileText,
  ArrowRight,
  Target,
  Briefcase,
  Trophy,
  Flame,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { SessionCard } from "@/components/dashboard/SessionCard";
import { ProgressChartWrapper } from "@/components/dashboard/ProgressChartWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Intervu AI",
  description: "Your interview preparation progress and overview",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch recent sessions with feedback
  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(
      `
      id,
      interview_type,
      company,
      status,
      total_score,
      duration_seconds,
      created_at
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const completedSessions =
    sessions?.filter((s) => s.status === "completed") ?? [];

  const averageScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce(
            (sum, s) => sum + (s.total_score ?? 0),
            0
          ) / completedSessions.length
        )
      : null;

  const bestScore =
    completedSessions.length > 0
      ? Math.max(...completedSessions.map((s) => s.total_score ?? 0))
      : null;

  const quickActions = [
    {
      title: "Start Mock Interview",
      description: "Practice with an AI interviewer tailored to your role",
      icon: MessageSquare,
      href: "/interview",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Coding Practice",
      description: "Solve coding problems with AI-powered hints and review",
      icon: Code2,
      href: "/practice",
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Analyze Resume",
      description: "Get AI feedback on your resume and predicted questions",
      icon: FileText,
      href: "/resume",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">
            Welcome back
            {profile?.full_name
              ? `, ${profile.full_name.split(" ")[0]}`
              : ""}
            ! 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            Ready to ace your next interview? Let&apos;s practice.
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-1.5">
          {profile?.target_role && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Briefcase className="h-3 w-3" />
              {profile.target_role}
            </Badge>
          )}
          {profile?.target_company && (
            <Badge variant="outline" className="text-xs gap-1">
              <Target className="h-3 w-3" />
              {profile.target_company}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatsCard
          label="Total Sessions"
          value={sessions?.length ?? 0}
          icon={MessageSquare}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <StatsCard
          label="Completed"
          value={completedSessions.length}
          icon={Trophy}
          iconColor="text-yellow-500"
          iconBg="bg-yellow-500/10"
        />
        <StatsCard
          label="Average Score"
          value={averageScore !== null ? `${averageScore}/10` : "—"}
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
        />
        <StatsCard
          label="Best Score"
          value={bestScore !== null ? `${bestScore}/10` : "—"}
          icon={Flame}
          iconColor="text-orange-500"
          iconBg="bg-orange-500/10"
        />
      </div>

      {/* Progress Chart — client component wrapper */}
      <ProgressChartWrapper />

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.href}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${action.bg} flex items-center justify-center mb-2`}
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <CardTitle className="text-base">
                    {action.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between"
                  >
                    <Link href={action.href}>
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/history">
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
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
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No sessions yet</p>
                <p className="text-sm text-muted-foreground">
                  Start your first mock interview to see your
                  progress here
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/interview">Start Interview</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}