"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UploadZone, type ResumeAnalysis } from "@/components/resume/UploadZone";
import { AnalysisCard } from "@/components/resume/AnalysisCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

export default function ResumePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<ResumeAnalysis | null>(null);
  const [pastAnalyses, setPastAnalyses] = useState<ResumeAnalysis[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPastAnalyses() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data, error } = await supabase
          .from("resume_analyses")
          .select(
            "id, ats_score, strengths, weaknesses, gap_analysis, predicted_questions, created_at, file_url"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!error && data) {
          setPastAnalyses(data as ResumeAnalysis[]);
        }
      } catch {
        // Silently fail — history is non-critical
      } finally {
        setIsLoadingHistory(false);
      }
    }

    fetchPastAnalyses();
  }, []);

  function handleAnalysisComplete(analysis: ResumeAnalysis) {
    setCurrentAnalysis(analysis);
    // Add to top of past analyses list
    setPastAnalyses((prev) => [analysis, ...prev.slice(0, 4)]);
    // Scroll to results
    setTimeout(() => {
      document
        .getElementById("analysis-results")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function getAtsColor(score: number): string {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-blue-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload your resume for AI-powered analysis, gap detection,
          and predicted interview questions
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Upload Resume
          </CardTitle>
          <CardDescription>
            Your profile settings (target role and company) will be
            used to personalize the analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadZone
            onAnalysisComplete={handleAnalysisComplete}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        </CardContent>
      </Card>

      {/* Current Analysis Results */}
      {currentAnalysis && (
        <div id="analysis-results" className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Analysis Results</h2>
            <Badge variant="secondary" className="text-xs">
              Latest
            </Badge>
          </div>
          <AnalysisCard analysis={currentAnalysis} />
        </div>
      )}

      {/* Past Analyses */}
      <div className="space-y-3">
        <Separator />
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Past Analyses</h2>
          {isLoadingHistory && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {!isLoadingHistory && pastAnalyses.length === 0 && (
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="font-medium text-sm">No past analyses</p>
              <p className="text-xs text-muted-foreground">
                Upload your resume above to get started
              </p>
            </CardContent>
          </Card>
        )}

        {pastAnalyses.length > 0 && (
          <div className="space-y-2">
            {pastAnalyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            Resume Analysis
                          </span>
                          <span
                            className={`text-sm font-bold ${getAtsColor(
                              analysis.ats_score
                            )}`}
                          >
                            {analysis.ats_score}/100
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(
                            analysis.created_at
                          ).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0"
                      onClick={() =>
                        setExpandedId(
                          expandedId === analysis.id
                            ? null
                            : analysis.id
                        )
                      }
                    >
                      {expandedId === analysis.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Analysis */}
                  {expandedId === analysis.id && (
                    <div className="mt-4 pt-4 border-t">
                      <AnalysisCard analysis={analysis} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}