import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  User,
  ArrowLeft,
  Clock,
  Trophy,
  Calendar,
} from "lucide-react";
import Link from "next/link";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-500";
  if (score >= 5) return "text-yellow-500";
  return "text-red-500";
}

export default async function SessionReviewPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch session details
  const { data: session, error: sessionError } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    notFound();
  }

  // Fetch messages
  const { data: messages } = await supabase
    .from("interview_messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  // Fetch feedback report
  const { data: feedback } = await supabase
    .from("feedback_reports")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/history">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to History
        </Link>
      </Button>

      {/* Session Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold capitalize">
            {session.interview_type.replace("_", " ")} Interview Review
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(session.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(session.duration_seconds)}
            </span>
          </div>
        </div>
        <Badge
          variant={
            session.status === "completed" ? "default" : "secondary"
          }
          className="capitalize"
        >
          {session.status.replace("_", " ")}
        </Badge>
      </div>

      {/* Session Meta */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Role: {session.role}</Badge>
        {session.company && (
          <Badge variant="outline">Company: {session.company}</Badge>
        )}
      </div>

      {/* Feedback Scores */}
      {feedback && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Overall", score: feedback.overall_score },
              { label: "Technical", score: feedback.technical_score },
              {
                label: "Communication",
                score: feedback.communication_score,
              },
              {
                label: "Problem Solving",
                score: feedback.problem_solving_score,
              },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="pt-4 pb-4 text-center">
                  <p className="text-xs text-muted-foreground">
                    {item.label}
                  </p>
                  <p
                    className={`text-3xl font-bold mt-1 ${getScoreColor(
                      item.score ?? 0
                    )}`}
                  >
                    {item.score ?? "—"}
                    <span className="text-sm text-muted-foreground font-normal">
                      /10
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Strengths */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-green-600">
                ✅ Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-green-500 shrink-0">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Improvements */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-orange-600">
                🎯 Areas to Improve
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.improvements?.map((imp: string, i: number) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-orange-500 shrink-0">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                📝 Detailed Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                {feedback.detailed_feedback}
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Conversation Transcript */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Full Transcript
            <Badge variant="secondary" className="ml-auto text-xs">
              {messages?.length ?? 0} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {messages && messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    msg.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <BrainCircuit className="h-3.5 w-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No messages found for this session.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-6">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/history">Back to History</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/interview">Start New Interview</Link>
        </Button>
      </div>
    </div>
  );
}