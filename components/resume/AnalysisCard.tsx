import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { ResumeAnalysis } from "./UploadZone";
import Link from "next/link";

interface AnalysisCardProps {
  analysis: ResumeAnalysis;
}

function getAtsColor(score: number): string {
  if (score >= 85) return "text-green-500";
  if (score >= 70) return "text-blue-500";
  if (score >= 50) return "text-yellow-500";
  return "text-red-500";
}

function getAtsBadge(score: number): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  if (score >= 85) return { label: "Excellent", variant: "default" };
  if (score >= 70) return { label: "Good", variant: "secondary" };
  if (score >= 50) return { label: "Average", variant: "outline" };
  return { label: "Needs Work", variant: "destructive" };
}

export function AnalysisCard({ analysis }: AnalysisCardProps) {
  const atsBadge = getAtsBadge(analysis.ats_score);

  return (
    <div className="space-y-4">
      {/* ATS Score Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                ATS Compatibility Score
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`text-5xl font-bold ${getAtsColor(
                    analysis.ats_score
                  )}`}
                >
                  {analysis.ats_score}
                </span>
                <div className="space-y-1">
                  <span className="text-lg text-muted-foreground">
                    / 100
                  </span>
                  <div>
                    <Badge variant={atsBadge.variant}>
                      {atsBadge.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Analyzed on{" "}
            {new Date(analysis.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </CardContent>
      </Card>

      {/* Strengths + Weaknesses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-green-500 shrink-0 mt-0.5">
                    •
                  </span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-red-500 shrink-0 mt-0.5">
                    •
                  </span>
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Gap Analysis */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
            {analysis.gap_analysis}
          </p>
        </CardContent>
      </Card>

      {/* Predicted Interview Questions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            Predicted Interview Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Based on your resume, you are likely to be asked these
            questions:
          </p>
          <div className="space-y-2">
            {analysis.predicted_questions.map((question, i) => (
              <div
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-muted"
              >
                <span className="text-xs font-bold text-primary shrink-0 mt-0.5">
                  Q{i + 1}
                </span>
                <p className="text-sm">{question}</p>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <Button variant="outline" size="sm" className="w-full" asChild>
  <Link href="/interview">
    <ExternalLink className="h-4 w-4" />
    Practice These Questions in Mock Interview
  </Link>
</Button>
        </CardContent>
      </Card>
    </div>
  );
}