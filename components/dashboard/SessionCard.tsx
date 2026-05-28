import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Clock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface SessionCardProps {
  id: string;
  interviewType: string;
  company: string | null;
  status: string;
  score: number | null;
  duration: number | null;
  createdAt: string;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    behavioral: "bg-purple-500/10 text-purple-500",
    technical: "bg-blue-500/10 text-blue-500",
    coding: "bg-green-500/10 text-green-500",
    system_design: "bg-orange-500/10 text-orange-500",
    mixed: "bg-pink-500/10 text-pink-500",
  };
  return colors[type] ?? "bg-muted text-muted-foreground";
}

export function SessionCard({
  id,
  interviewType,
  company,
  status,
  score,
  duration,
  createdAt,
}: SessionCardProps) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left — icon + info */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                getTypeColor(interviewType)
              )}
            >
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium capitalize">
                {interviewType.replace("_", " ")} Interview
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {company && <span>{company}</span>}
                {company && duration && <span>·</span>}
                {duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(duration)}
                  </span>
                )}
                <span>
                  {new Date(createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right — score + status + action */}
          <div className="flex items-center gap-2 shrink-0">
            {score !== null && (
              <div className="flex items-center gap-1 text-xs">
                <Trophy className="h-3 w-3 text-yellow-500" />
                <span className="font-semibold">{score}/10</span>
              </div>
            )}
            <Badge
              variant={
                status === "completed"
                  ? "default"
                  : status === "in_progress"
                  ? "secondary"
                  : "outline"
              }
              className="capitalize text-xs"
            >
              {status.replace("_", " ")}
            </Badge>
            {status === "completed" && (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
              >
                <Link href={`/interview/${id}`}>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}