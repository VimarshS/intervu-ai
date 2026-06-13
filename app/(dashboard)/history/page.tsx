import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ArrowRight,
  Trophy,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { SessionCard } from "@/components/dashboard/SessionCard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Session History — Intervu AI",
  description: "Review all your past interview sessions",
};

interface RawSession {
  id: string;
  interview_type: string;
  company: string | null;
  status: string;
  total_score: number | null;
  duration_seconds: number | null;
  created_at: string;
  feedback_reports: {
    overall_score: number | null;
    technical_score: number | null;
    communication_score: number | null;
    problem_solving_score: number | null;
  } | null;
}

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rawSessions } = await supabase
    .from("interview_sessions")
    .select(
      `
      id,
      interview_type,
      company,
      status,
      total_score,
      duration_seconds,
      created_at,
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

  const sessions = (rawSessions ?? []) as unknown as RawSession[];

  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  );

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
            <p className="text-xs text-muted-foreground">
              Total Sessions
            </p>
            <p className="text-2xl font-bold mt-1">
              {sessions.length}
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
            <p className="text-xs text-muted-foreground">
              Average Score
            </p>
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

      {/* Score Breakdown for completed sessions */}
      {completedSessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {["technical", "communication", "problem_solving"].map(
            (dimension) => {
              const avg = Math.round(
                completedSessions.reduce((sum, s) => {
                  const score =
                    s.feedback_reports?.[
                      `${dimension}_score` as keyof typeof s.feedback_reports
                    ];
                  return sum + (typeof score === "number" ? score : 0);
                }, 0) / completedSessions.length
              );
              return (
                <Card key={dimension}>
                  <CardContent className="pt-4 pb-4 text-center">
                    <p className="text-xs text-muted-foreground capitalize">
                      {dimension.replace("_", " ")}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Trophy className="h-3.5 w-3.5 text-yellow-500" />
                      <p className="text-xl font-bold">{avg}/10</p>
                    </div>
                  </CardContent>
                </Card>
              );
            }
          )}
        </div>
      )}

      {/* Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            All Sessions
            {sessions.length > 0 && (
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

        {sessions.length > 0 ? (
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
            <CardContent className="py-16 flex flex-col items-center justify-center text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                <MessageSquare className="h-7 w-7 text-muted-foreground" />
              </div>
              <div>
          <p
            className="font-medium text-slate-300"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
           >
            No sessions yet — that&apos;s about to change.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Complete your first mock interview to see your
            progress here. Most users feel more confident
            after just 3 sessions.
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