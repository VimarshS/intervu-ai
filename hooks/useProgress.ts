 "use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface SessionDataPoint {
  date: string;
  overall: number;
  technical: number;
  communication: number;
  problem_solving: number;
  interview_type: string;
}

export interface ProgressStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  bestScore: number | null;
  latestScore: number | null;
  improvement: number | null;
  streakDays: number;
}

export interface ProgressData {
  stats: ProgressStats;
  chartData: SessionDataPoint[];
  radarData: {
    subject: string;
    score: number;
    fullMark: number;
  }[];
}

// Explicit type for the raw Supabase joined row
interface RawSession {
  id: string;
  interview_type: string;
  created_at: string;
  status: string;
  total_score: number | null;
  feedback_reports: {
    overall_score: number | null;
    technical_score: number | null;
    communication_score: number | null;
    problem_solving_score: number | null;
  } | null;
}

export function useProgress() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: rawSessions, error: sessionsError } = await supabase
          .from("interview_sessions")
          .select(
            `
            id,
            interview_type,
            created_at,
            status,
            total_score,
            feedback_reports (
              overall_score,
              technical_score,
              communication_score,
              problem_solving_score
            )
          `
          )
          .eq("user_id", user.id)
          .eq("status", "completed")
          .order("created_at", { ascending: true });

        if (sessionsError) {
          setError("Failed to load progress data");
          return;
        }

        // Cast to our explicit type — bypasses Supabase inference issues
       const completed = (rawSessions ?? []) as unknown as RawSession[];

        // Build chart data — only sessions that have feedback
        const chartData: SessionDataPoint[] = [];

        for (const s of completed) {
          if (!s.feedback_reports) continue;

          chartData.push({
            date: new Date(s.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            }),
            overall: s.feedback_reports.overall_score ?? 0,
            technical: s.feedback_reports.technical_score ?? 0,
            communication: s.feedback_reports.communication_score ?? 0,
            problem_solving:
              s.feedback_reports.problem_solving_score ?? 0,
            interview_type: s.interview_type,
          });
        }

        // Average scores for radar chart
        const count = chartData.length;

        const avg = (key: keyof SessionDataPoint): number => {
          if (count === 0) return 0;
          return Math.round(
            chartData.reduce((sum, d) => sum + (d[key] as number), 0) /
              count
          );
        };

        const radarData = [
          { subject: "Technical", score: avg("technical"), fullMark: 10 },
          {
            subject: "Communication",
            score: avg("communication"),
            fullMark: 10,
          },
          {
            subject: "Problem Solving",
            score: avg("problem_solving"),
            fullMark: 10,
          },
          { subject: "Overall", score: avg("overall"), fullMark: 10 },
        ];

        // Streak calculation
        const sessionDates = new Set(
          completed.map((s) =>
            new Date(s.created_at).toLocaleDateString("en-IN")
          )
        );

        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          if (sessionDates.has(d.toLocaleDateString("en-IN"))) {
            streak++;
          } else {
            break;
          }
        }

        // Score stats
        const scores = completed
          .map((s) => s.total_score)
          .filter((s): s is number => s !== null);

        const firstScore =
          chartData.length > 0 ? chartData[0].overall : null;
        const latestScore =
          chartData.length > 0
            ? chartData[chartData.length - 1].overall
            : null;
        const improvement =
          firstScore !== null && latestScore !== null
            ? latestScore - firstScore
            : null;

        const stats: ProgressStats = {
          totalSessions: completed.length,
          completedSessions: completed.length,
          averageScore:
            scores.length > 0
              ? Math.round(
                  scores.reduce((a, b) => a + b, 0) / scores.length
                )
              : null,
          bestScore: scores.length > 0 ? Math.max(...scores) : null,
          latestScore,
          improvement,
          streakDays: streak,
        };

        setData({ stats, chartData, radarData });
      } catch {
        setError("Something went wrong loading progress.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgress();
  }, []);

  return { data, isLoading, error };
}