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
  ArrowRight,
  Clock,
  Trophy,
  Filter,
} from "lucide-react";
import Link from "next/link";
import type { InterviewSession } from "@/types/database";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function getInterviewTypeColor(type: string): string {
  const colors: Record<string, string> = {
    behavioral: "bg-purple-500/10 text-purple-500",
    technical: "bg-blue-500/10 text-blue-500",
    coding: "bg-green-500/10 text-green-500",
    system_design: "bg-orange-500/10 text-orange-500",
    mixed: "bg-pink-500/10 text-pink-500",
  };
  return colors[type] ?? "bg-muted text-muted-foreground";
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sessions } = await supabase
    .from("interview_sessions")
    .select(
      `
      *,
      feedback_reports (
        overall_score,
        technical_score,
        communication_score,
        problem_solving_score
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Session History</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review all your past interview sessions and track improvement
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Total Sessions</p>
            <p className="text-2xl font-bold mt-1">
              {sessions?.length ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold mt-1">
              {completedSessions.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold mt-1">
              {averageScore !== null ? `${averageScore}/10` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Best Score</p>
            <p className="text-2xl font-bold mt-1">
              {bestScore !== null ? `${bestScore}/10` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            All Sessions
            {sessions && sessions.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({sessions.length} total)
              </span>
            )}
          </h2>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Newest first</span>
          </div>
        </div>

        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session: InterviewSession & {
              feedback_reports: {
                overall_score: number | null;
                technical_score: number | null;
                communication_score: number | null;
                problem_solving_score: number | null;
              } | null;
            }) => (
              <Card
                key={session.id}
                className="hover:shadow-sm transition-shadow"
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left — type icon + info */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${getInterviewTypeColor(
                          session.interview_type
                        )}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm capitalize">
                          {session.interview_type.replace("_", " ")}{" "}
                          Interview
                        </p>
                        {session.company && (
                          <p className="text-xs text-muted-foreground">
                            Target: {session.company}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            {new Date(session.created_at).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                          {session.duration_seconds && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(session.duration_seconds)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right — scores + status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge
                        variant={
                          session.status === "completed"
                            ? "default"
                            : session.status === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                        className="capitalize text-xs"
                      >
                        {session.status.replace("_", " ")}
                      </Badge>

                      {session.feedback_reports?.overall_score !== null &&
                        session.feedback_reports?.overall_score !==
                          undefined && (
                          <div className="flex items-center gap-1 text-xs">
                            <Trophy className="h-3 w-3 text-yellow-500" />
                            <span className="font-semibold">
                              {session.feedback_reports.overall_score}/10
                            </span>
                          </div>
                        )}

                      {session.status === "completed" && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                        >
                          <Link href={`/interview/${session.id}`}>
                            Review
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Score breakdown if available */}
                  {session.feedback_reports && (
                    <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Technical
                        </p>
                        <p className="text-sm font-semibold">
                          {session.feedback_reports.technical_score ??
                            "—"}
                          /10
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Communication
                        </p>
                        <p className="text-sm font-semibold">
                          {session.feedback_reports.communication_score ??
                            "—"}
                          /10
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Problem Solving
                        </p>
                        <p className="text-sm font-semibold">
                          {session.feedback_reports
                            .problem_solving_score ?? "—"}
                          /10
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No sessions yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete your first mock interview to see your history
                  here
                </p>
              </div>
              <Button asChild size="sm">
                <Link href="/interview">
                  Start First Interview
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}