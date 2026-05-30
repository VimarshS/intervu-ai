"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { CodeEditor } from "@/components/coding/CodeEditor";
import { OutputPanel } from "@/components/coding/OutputPanel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Loader2,
  Code2,
  Lightbulb,
  RefreshCw,
  CheckCircle2,
  XCircle,
  BrainCircuit,
} from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  LANGUAGE_DISPLAY_NAMES,
  DEFAULT_CODE,
} from "@/lib/piston/client";
import type { CodingProblem } from "@/lib/ai/prompts/coding";

interface CodeReview {
  is_correct: boolean;
  time_complexity: string;
  space_complexity: string;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  optimized_approach: string;
  detailed_review: string;
}

type PracticeState =
  | "setup"
  | "loading_problem"
  | "solving"
  | "running"
  | "reviewing"
  | "reviewed";

function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "Easy": return "text-green-500";
    case "Medium": return "text-yellow-500";
    case "Hard": return "text-red-500";
    default: return "text-muted-foreground";
  }
}

export default function PracticePage() {
  const [practiceState, setPracticeState] =
    useState<PracticeState>("setup");
  const [selectedLanguage, setSelectedLanguage] = useState(
    SUPPORTED_LANGUAGES[0]
  );
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  // User only edits this — the visible function code
  const [userCode, setUserCode] = useState(
    DEFAULT_CODE[SUPPORTED_LANGUAGES[0].language]
  );

  // Hidden from user — stored separately
  const [helperCode, setHelperCode] = useState<string>("");
  const [driverCode, setDriverCode] = useState<string>("");

  const [problem, setProblem] = useState<CodingProblem | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [outputError, setOutputError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(
    null
  );
  const [review, setReview] = useState<CodeReview | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const topics = [
    "Arrays", "Strings", "Linked Lists", "Trees", "Graphs",
    "Dynamic Programming", "Sorting", "Binary Search",
    "Hashmaps", "Recursion", "Stack and Queue", "Two Pointers",
  ];

  async function generateProblem() {
    setPracticeState("loading_problem");
    setReview(null);
    setOutput(null);
    setOutputError(null);
    setShowHint(false);
    setHintIndex(0);

    try {
      const response = await fetch("/api/coding/problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage.language,
          topic: selectedTopic || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Failed to generate problem");
        setPracticeState("setup");
        return;
      }

      const p: CodingProblem = data.problem;

      setProblem(p);

      // Store hidden code separately — user never sees these
      setHelperCode(p.helper_code ?? "");
      setDriverCode(p.driver_code ?? "");

      // Only show the function starter code in the editor
      setUserCode(
        p.starter_code ||
        DEFAULT_CODE[selectedLanguage.language]
      );

      setPracticeState("solving");
    } catch (err) {
      console.error("Problem generation error:", err);
      toast.error("Failed to generate problem. Please try again.");
      setPracticeState("setup");
    }
  }

  async function runCode() {
    if (!userCode.trim()) {
      toast.error("Please write some code first");
      return;
    }

    setPracticeState("running");
    setOutput(null);
    setOutputError(null);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/code/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLanguage.language,
          version: selectedLanguage.version,
          // Combine all three parts — user only wrote the middle part
          code: [helperCode, userCode, driverCode]
            .filter((p) => p && p.trim().length > 0)
            .join("\n"),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Execution failed");
        setPracticeState("solving");
        return;
      }

      const elapsed = Date.now() - startTime;
      setExecutionTime(elapsed);

      const result = data.result;

      if (result.run.stderr && result.run.stderr.length > 0) {
        setOutputError(result.run.stderr);
        setOutput(null);
      } else {
        setOutput(result.run.stdout || "No output");
        setOutputError(null);
      }

      setPracticeState("solving");
    } catch {
      toast.error("Execution failed. Please try again.");
      setPracticeState("solving");
    }
  }

  async function submitSolution() {
    if (!problem || !userCode.trim()) return;

    setPracticeState("reviewing");

    try {
      const response = await fetch("/api/coding/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problem.problem,
          // Send only the user's function — not helper or driver
          code: userCode,
          language: selectedLanguage.language,
          output: output ?? "No output — code was not run",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Failed to generate review");
        setPracticeState("solving");
        return;
      }

      setReview(data.review);
      setPracticeState("reviewed");
    } catch (err) {
      console.error("Review error:", err);
      toast.error("Failed to generate review. Please try again.");
      setPracticeState("solving");
    }
  }

  function handleLanguageChange(language: string) {
    const lang = SUPPORTED_LANGUAGES.find(
      (l) => l.language === language
    );
    if (lang) {
      setSelectedLanguage(lang);
      setUserCode(DEFAULT_CODE[language]);
      setHelperCode("");
      setDriverCode("");
    }
  }

  function handleNextHint() {
    if (problem && hintIndex < problem.hints.length - 1) {
      setHintIndex((prev) => prev + 1);
    }
  }

  const resetPractice = useCallback(() => {
    setPracticeState("setup");
    setProblem(null);
    setUserCode(DEFAULT_CODE[selectedLanguage.language]);
    setHelperCode("");
    setDriverCode("");
    setOutput(null);
    setOutputError(null);
    setReview(null);
    setShowHint(false);
    setHintIndex(0);
    setExecutionTime(null);
  }, [selectedLanguage.language]);

  // ── SETUP SCREEN ──────────────────────────────────────────
  if (practiceState === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Coding Practice</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Solve AI-generated coding problems with real code
            execution and AI review
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              Configure Practice Session
            </CardTitle>
            <CardDescription>
              The AI will generate a LeetCode-style problem tailored
              to your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Programming Language
              </label>
              <Select
                defaultValue={selectedLanguage.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.language}
                      value={lang.language}
                    >
                      {LANGUAGE_DISPLAY_NAMES[lang.language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Topic{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Select
                onValueChange={setSelectedTopic}
                value={selectedTopic}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Let AI choose the topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full" onClick={generateProblem}>
              <BrainCircuit className="mr-2 h-4 w-4" />
              Generate Problem
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── LOADING PROBLEM ───────────────────────────────────────
  if (practiceState === "loading_problem") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Generating your coding problem...
          </p>
        </div>
      </div>
    );
  }

  // ── SOLVING + REVIEWED SCREEN ─────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {problem && (
            <>
              <h1 className="text-lg font-bold">{problem.title}</h1>
              <Badge
                variant="outline"
                className={getDifficultyColor(problem.difficulty)}
              >
                {problem.difficulty}
              </Badge>
              <Badge variant="secondary">{problem.topic}</Badge>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={resetPractice}>
          <RefreshCw className="h-4 w-4 mr-1" />
          New Problem
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left — Problem + Review */}
        <div className="space-y-4">
          {problem && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="leading-relaxed text-muted-foreground">
                  {problem.problem}
                </p>

                {problem.examples.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                      Examples
                    </p>
                    {problem.examples.map((ex, i) => (
                      <div
                        key={i}
                        className="rounded-lg bg-muted p-3 space-y-1 text-xs font-mono"
                      >
                        <p>
                          <span className="text-muted-foreground">
                            Input:
                          </span>{" "}
                          {ex.input}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Output:
                          </span>{" "}
                          {ex.output}
                        </p>
                        {ex.explanation && (
                          <p className="text-muted-foreground font-sans">
                            {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-medium text-xs uppercase tracking-wide text-muted-foreground">
                      Constraints
                    </p>
                    <ul className="space-y-0.5">
                      {problem.constraints.map((c, i) => (
                        <li
                          key={i}
                          className="text-xs text-muted-foreground font-mono"
                        >
                          • {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem.hints.length > 0 && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setShowHint(true);
                        if (showHint) handleNextHint();
                      }}
                    >
                      <Lightbulb className="h-3.5 w-3.5 mr-1.5" />
                      {!showHint
                        ? "Show Hint"
                        : hintIndex < problem.hints.length - 1
                        ? "Next Hint"
                        : "No More Hints"}
                    </Button>
                    {showHint && (
                      <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-600 dark:text-yellow-400">
                        💡 {problem.hints[hintIndex]}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* AI Review Results */}
          {review && practiceState === "reviewed" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  AI Code Review
                  {review.is_correct ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-xs text-muted-foreground">
                      Score
                    </p>
                    <p
                      className={`text-xl font-bold ${
                        review.overall_score >= 7
                          ? "text-green-500"
                          : review.overall_score >= 5
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {review.overall_score}/10
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-xs text-muted-foreground">
                      Time
                    </p>
                    <p className="text-sm font-semibold">
                      {review.time_complexity}
                    </p>
                  </div>
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-xs text-muted-foreground">
                      Space
                    </p>
                    <p className="text-sm font-semibold">
                      {review.space_complexity}
                    </p>
                  </div>
                </div>

                <Separator />

                {review.strengths.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-green-600">
                      ✅ Strengths
                    </p>
                    {review.strengths.map((s, i) => (
                      <p
                        key={i}
                        className="text-xs text-muted-foreground flex gap-2"
                      >
                        <span className="text-green-500 shrink-0">
                          •
                        </span>
                        {s}
                      </p>
                    ))}
                  </div>
                )}

                {review.improvements.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-orange-600">
                      🎯 Improvements
                    </p>
                    {review.improvements.map((imp, i) => (
                      <p
                        key={i}
                        className="text-xs text-muted-foreground flex gap-2"
                      >
                        <span className="text-orange-500 shrink-0">
                          •
                        </span>
                        {imp}
                      </p>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs font-semibold">
                    💡 Optimized Approach
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {review.optimized_approach}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold">
                    📝 Detailed Review
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {review.detailed_review}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Editor + Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select
                value={selectedLanguage.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="w-40 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <SelectItem
                      key={lang.language}
                      value={lang.language}
                    >
                      {LANGUAGE_DISPLAY_NAMES[lang.language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Indicator that driver code is active */}
              {driverCode && (
                <Badge variant="secondary" className="text-xs">
                  Auto-tested
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={runCode}
                disabled={
                  practiceState === "running" ||
                  practiceState === "reviewing"
                }
              >
                {practiceState === "running" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Play className="h-3.5 w-3.5 mr-1.5" />
                )}
                Run
              </Button>
              <Button
                size="sm"
                onClick={submitSolution}
                disabled={
                  practiceState === "running" ||
                  practiceState === "reviewing" ||
                  practiceState === "reviewed"
                }
              >
                {practiceState === "reviewing" ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <BrainCircuit className="h-3.5 w-3.5 mr-1.5" />
                )}
                {practiceState === "reviewed"
                  ? "Reviewed"
                  : "Submit for Review"}
              </Button>
            </div>
          </div>

          {/* Monaco Editor — shows only user's function */}
          <CodeEditor
            value={userCode}
            onChange={setUserCode}
            language={selectedLanguage.language}
            height="380px"
          />

          {/* Output Panel */}
          <OutputPanel
            output={output}
            error={outputError}
            isRunning={practiceState === "running"}
            executionTime={executionTime}
            language={selectedLanguage.language}
          />
        </div>
      </div>
    </div>
  );
}