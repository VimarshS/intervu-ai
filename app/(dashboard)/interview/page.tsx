"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Square,
  Loader2,
  BrainCircuit,
  User,
  Clock,
} from "lucide-react";
import type { InterviewType, ExperienceLevel } from "@/types/database";

const setupSchema = z.object({
  role: z.string().min(2, "Please enter a role"),
  company: z.string().optional(),
  interview_type: z.enum([
    "behavioral",
    "technical",
    "coding",
    "system_design",
    "mixed",
  ] as const),
  experience_level: z.enum([
    "fresher",
    "junior",
    "mid",
    "senior",
  ] as const),
});

type SetupFormData = z.infer<typeof setupSchema>;

type Message = {
  role: "user" | "assistant";
  content: string;
};

type InterviewState = "setup" | "active" | "ending" | "feedback";

interface FeedbackReport {
  overall_score: number;
  technical_score: number;
  communication_score: number;
  problem_solving_score: number;
  strengths: string[];
  improvements: string[];
  detailed_feedback: string;
}

export default function InterviewPage() {
  const [state, setState] = useState<InterviewState>("setup");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [userInput, setUserInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SetupFormData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      interview_type: "behavioral",
      experience_level: "fresher",
    },
  });

  const watchedType = watch("interview_type");

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  // Timer
  useEffect(() => {
    if (state !== "active" || !startTime) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [state, startTime]);

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function onStartInterview(data: SetupFormData) {
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Failed to start interview");
        return;
      }

      setSessionId(result.session_id);
      setSystemPrompt(result.system_prompt);
      setMessages([{ role: "assistant", content: result.message }]);
      setStartTime(new Date());
      setState("active");
    } catch {
      toast.error("Failed to connect. Please try again.");
    }
  }

  async function onSendMessage() {
    const trimmed = userInput.trim();
    if (!trimmed || isAiTyping || !sessionId) return;

    const newMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setUserInput("");
    setIsAiTyping(true);

    try {
      const response = await fetch("/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_message: trimmed,
          system_prompt: systemPrompt,
          history: messages, // Send history before new message
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Failed to get response");
        return;
      }

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: result.message },
      ]);
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setIsAiTyping(false);
    }
  }

  async function onEndInterview() {
    if (!sessionId) return;
    setState("ending");

    try {
      const response = await fetch("/api/interview/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          duration_seconds: elapsed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error ?? "Failed to generate feedback");
        setState("active");
        return;
      }

      setFeedback(result.feedback);
      setState("feedback");
    } catch {
      toast.error("Failed to end interview. Please try again.");
      setState("active");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  }

  // ── SETUP SCREEN ──────────────────────────────────────────
  if (state === "setup") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Start Mock Interview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure your interview session and practice with AI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              Interview Setup
            </CardTitle>
            <CardDescription>
              The AI will tailor questions based on your selections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onStartInterview)}
              className="space-y-5"
            >
              {/* Role */}
              <div className="space-y-2">
                <Label htmlFor="role">Target Role</Label>
                <Input
                  id="role"
                  placeholder="e.g. Software Development Engineer"
                  {...register("role")}
                />
                {errors.role && (
                  <p className="text-destructive text-xs">
                    {errors.role.message}
                  </p>
                )}
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label htmlFor="company">
                  Target Company{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="company"
                  placeholder="e.g. Google, Amazon, any startup..."
                  {...register("company")}
                />
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select
                  defaultValue="behavioral"
                  onValueChange={(value) =>
                    setValue(
                      "interview_type",
                      value as InterviewType
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">
                      Behavioral
                    </SelectItem>
                    <SelectItem value="technical">
                      Technical
                    </SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="system_design">
                      System Design
                    </SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  defaultValue="fresher"
                  onValueChange={(value) =>
                    setValue(
                      "experience_level",
                      value as ExperienceLevel
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresher">
                      Fresher — 0 years
                    </SelectItem>
                    <SelectItem value="junior">
                      Junior — 1 to 2 years
                    </SelectItem>
                    <SelectItem value="mid">
                      Mid-level — 3 to 5 years
                    </SelectItem>
                    <SelectItem value="senior">
                      Senior — 5+ years
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interview type description */}
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                {watchedType === "behavioral" &&
                  "Questions about past experiences, teamwork, and soft skills using the STAR method."}
                {watchedType === "technical" &&
                  "Conceptual and theoretical questions about CS fundamentals and your target role."}
                {watchedType === "coding" &&
                  "Algorithmic problems with focus on approach, complexity, and optimization."}
                {watchedType === "system_design" &&
                  "Open-ended architecture questions testing scalability and design thinking."}
                {watchedType === "mixed" &&
                  "A balanced mix of behavioral and technical questions."}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                {isSubmitting
                  ? "Preparing Interview..."
                  : "Start Interview"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── FEEDBACK SCREEN ───────────────────────────────────────
  if (state === "feedback" && feedback) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Interview Feedback</h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-generated analysis of your performance
          </p>
        </div>

        {/* Score Cards */}
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
                  className={`text-3xl font-bold mt-1 ${
                    item.score >= 7
                      ? "text-green-500"
                      : item.score >= 5
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {item.score}
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
              {feedback.strengths.map((s, i) => (
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
              {feedback.improvements.map((imp, i) => (
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

        <Button
          className="w-full"
          onClick={() => {
            setState("setup");
            setMessages([]);
            setSessionId(null);
            setSystemPrompt("");
            setFeedback(null);
            setElapsed(0);
            setStartTime(null);
          }}
        >
          Start Another Interview
        </Button>
      </div>
    );
  }

  // ── ACTIVE INTERVIEW SCREEN ───────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Interview Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Interview
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(elapsed)}
          </Badge>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={onEndInterview}
          disabled={state === "ending"}
        >
          {state === "ending" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Square className="mr-2 h-4 w-4" />
          )}
          {state === "ending" ? "Generating Feedback..." : "End Interview"}
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <BrainCircuit className="h-4 w-4 text-primary" />
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
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
          </div>
        ))}

        {/* AI typing indicator */}
        {isAiTyping && (
          <div className="flex gap-3 justify-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <BrainCircuit className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="mt-4 shrink-0">
        <div className="flex gap-2 items-center bg-muted rounded-2xl px-4 py-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer... (Enter to send)"
            disabled={isAiTyping || state === "ending"}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm px-0"
          />
          <Button
            size="icon"
            onClick={onSendMessage}
            disabled={
              !userInput.trim() || isAiTyping || state === "ending"
            }
            className="shrink-0 h-8 w-8 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send • Click End Interview when finished
        </p>
      </div>
    </div>
  );
}