"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useInterview } from "@/hooks/useInterview";
import { useVoice } from "@/hooks/useVoice";
import { VoiceToggle } from "@/components/interview/VoiceToggle";
import type { InterviewType, ExperienceLevel } from "@/types/database";
import { UpgradeModal } from "@/components/credits/UpgradeModal";

const setupSchema = z.object({
  role: z.string().min(2, "Please enter a role"),
  company: z.string().optional(),
  interview_type: z.enum([
    "behavioral", "technical", "coding", "system_design", "mixed",
  ] as const),
  experience_level: z.enum([
    "fresher", "junior", "mid", "senior",
  ] as const),
});

type SetupFormData = z.infer<typeof setupSchema>;

export default function InterviewPage() {
  const [userInput, setUserInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    interviewState,
    messages,
    feedback,
    isAiTyping,
    elapsed,
    formatTime,
    startInterview,
    sendMessage,
    endInterview,
    resetInterview,
  } = useInterview();

  const {
    isSupported,
    isListening,
    isSpeaking,
    transcript,
    interimTranscript,
    fillerWordCount,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  } = useVoice();

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

  // When AI sends a new message in voice mode — speak it aloud
  useEffect(() => {
    if (
      !isVoiceMode ||
      messages.length === 0 ||
      interviewState !== "active"
    )
      return;

    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return;

    // Speak the AI message then auto-start listening
    speak(lastMessage.content, () => {
      if (isVoiceMode && interviewState === "active") {
        startListening();
      }
    });
  }, [messages]);

  // When voice transcript is ready — populate the input
  useEffect(() => {
    if (transcript) {
      setUserInput(transcript);
    }
  }, [transcript]);

async function onStartInterview(data: SetupFormData) {
  const result = await startInterview({
    role: data.role,
    company: data.company ?? null,
    interview_type: data.interview_type as InterviewType,
    experience_level: data.experience_level as ExperienceLevel,
  });

  if (result?.requiresPayment) {
    setShowUpgradeModal(true);
  }
}

  async function onSendMessage() {
    if (!userInput.trim()) return;

    // Stop listening before sending in voice mode
    if (isListening) stopListening();

    const success = await sendMessage(userInput);
    if (success) {
      setUserInput("");
      resetTranscript();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  }

  function handleToggleVoiceMode() {
    if (isVoiceMode) {
      // Turning off — stop everything
      stopListening();
      stopSpeaking();
      setIsVoiceMode(false);
    } else {
      setIsVoiceMode(true);
    }
  }

  // ── SETUP SCREEN ──────────────────────────────────────────
  if (interviewState === "setup" || interviewState === "idle") {
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

              <div className="space-y-2">
                <Label>Interview Type</Label>
                <Select
                  defaultValue="behavioral"
                  onValueChange={(value) =>
                    setValue("interview_type", value as InterviewType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="system_design">System Design</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select
                  defaultValue="fresher"
                  onValueChange={(value) =>
                    setValue("experience_level", value as ExperienceLevel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fresher">Fresher — 0 years</SelectItem>
                    <SelectItem value="junior">Junior — 1 to 2 years</SelectItem>
                    <SelectItem value="mid">Mid-level — 3 to 5 years</SelectItem>
                    <SelectItem value="senior">Senior — 5+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                {isSubmitting ? "Preparing Interview..." : "Start Interview"}
              </Button>
            </form>
          </CardContent>
        </Card>
        {/* Upgrade Modal */}
<UpgradeModal
  isOpen={showUpgradeModal}
  onClose={() => setShowUpgradeModal(false)}
/>
      </div>
    );
  }

  // ── FEEDBACK SCREEN ───────────────────────────────────────
  if (interviewState === "feedback" && feedback) {
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
            { label: "Communication", score: feedback.communication_score },
            { label: "Problem Solving", score: feedback.problem_solving_score },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-xs text-muted-foreground">{item.label}</p>
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

        {/* Filler word summary if voice was used */}
        {fillerWordCount > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    Voice Communication Analysis
                  </p>
                  <p className="text-xs text-muted-foreground">
                    You used{" "}
                    <span className="font-semibold text-yellow-600">
                      {fillerWordCount} filler{" "}
                      {fillerWordCount === 1 ? "word" : "words"}
                    </span>{" "}
                    (um, uh, like, etc.) during this session. Aim
                    for under 5 in a real interview.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            <CardTitle className="text-base">📝 Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {feedback.detailed_feedback}
            </p>
          </CardContent>
        </Card>

        <Button className="w-full" onClick={resetInterview}>
          Start Another Interview
        </Button>
      </div>
    );
  }

  // ── ACTIVE INTERVIEW SCREEN ───────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Interview Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Interview
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(elapsed)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Voice Toggle */}
          <VoiceToggle
            isSupported={isSupported}
            isListening={isListening}
            isSpeaking={isSpeaking}
            isVoiceMode={isVoiceMode}
            fillerWordCount={fillerWordCount}
            onToggleVoiceMode={handleToggleVoiceMode}
            onStartListening={startListening}
            onStopListening={stopListening}
            onStopSpeaking={stopSpeaking}
          />

          <Button
            variant="destructive"
            size="sm"
            onClick={endInterview}
            disabled={interviewState === "ending"}
          >
            {interviewState === "ending" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            {interviewState === "ending"
              ? "Generating Feedback..."
              : "End Interview"}
          </Button>
        </div>
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
      <div className="mt-4 shrink-0 space-y-2">
        {/* Voice transcript preview */}
        {isVoiceMode && interimTranscript && (
          <div className="px-4 py-2 rounded-lg bg-muted/50 border border-dashed text-xs text-muted-foreground italic">
            {interimTranscript}...
          </div>
        )}

        <div className="flex gap-2 items-center bg-muted rounded-2xl px-4 py-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isVoiceMode
                ? "Click Speak or type your answer..."
                : "Type your answer... (Enter to send)"
            }
            disabled={isAiTyping || interviewState === "ending"}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm px-0"
          />
          <Button
            size="icon"
            onClick={onSendMessage}
            disabled={
              !userInput.trim() ||
              isAiTyping ||
              interviewState === "ending"
            }
            className="shrink-0 h-8 w-8 rounded-full"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {isVoiceMode
            ? "Voice mode active — speak your answer or type it"
            : "Press Enter to send • Click End Interview when finished"}
        </p>
      </div>
    </div>
  );
}