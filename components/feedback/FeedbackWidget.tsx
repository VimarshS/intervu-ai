"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "closed" | "sentiment" | "context" | "open" | "done";

const SENTIMENTS = [
  { emoji: "😞", label: "Poor", value: "poor" },
  { emoji: "😕", label: "Meh", value: "meh" },
  { emoji: "😐", label: "Okay", value: "okay" },
  { emoji: "🙂", label: "Good", value: "good" },
  { emoji: "😄", label: "Great", value: "great" },
];

const POSITIVE_CONTEXTS = [
  "Preparing for a placement interview",
  "Practicing after a rejection",
  "Testing the platform",
  "Improving my scores",
  "Something else",
];

const NEGATIVE_CONTEXTS = [
  "Interview questions felt generic",
  "Feedback wasn't helpful",
  "Something didn't work",
  "Hard to navigate",
  "Something else",
];

export function FeedbackWidget() {
  const [step, setStep] = useState<Step>("closed");
  const [sentiment, setSentiment] = useState<string>("");
  const [context, setContext] = useState<string>("");
  const [openText, setOpenText] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPositive =
    sentiment === "good" || sentiment === "great";
  const contextOptions = isPositive
    ? POSITIVE_CONTEXTS
    : NEGATIVE_CONTEXTS;
  const contextQuestion = isPositive
    ? "What brought you here today?"
    : "What felt frustrating?";

  function handleSentiment(value: string) {
    setSentiment(value);
    setStep("context");
  }

  function handleContext(value: string) {
    setContext(value);
    setStep("open");
  }

  async function handleSubmit() {
    setIsSubmitting(true);

    const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

    if (!formId) {
      console.error("Formspree ID not configured");
      setIsSubmitting(false);
      setStep("done");
      return;
    }

    try {
      await fetch(`https://formspree.io/f/${formId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentiment,
          context,
          message: openText || "No additional message",
          page: typeof window !== "undefined" ? window.location.pathname : "unknown",
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Silently fail — don't interrupt user for feedback errors
    } finally {
      setIsSubmitting(false);
      setStep("done");
    }
  }

  function handleClose() {
    setStep("closed");
    setSentiment("");
    setContext("");
    setOpenText("");
  }

  return (
    <>
      {/* Floating Button */}
      {step === "closed" && (
        <button
          onClick={() => setStep("sentiment")}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 hover:text-slate-100 transition-all shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="h-4 w-4 text-indigo-400" />
          Share feedback
        </button>
      )}

      {/* Modal */}
      {step !== "closed" && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-indigo-400" />
              <span
                className="text-sm font-semibold text-slate-100"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                Quick feedback
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Step 1 — Sentiment */}
          {step === "sentiment" && (
            <div className="p-4 space-y-4">
              <p className="text-sm text-slate-300">
                How was your experience today?
              </p>
              <div className="flex items-center justify-between">
                {SENTIMENTS.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => handleSentiment(s.value)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-800 transition-colors group"
                    title={s.label}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {s.emoji}
                    </span>
                    <span className="text-xs text-slate-600 group-hover:text-slate-400">
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 — Context */}
          {step === "context" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {SENTIMENTS.find((s) => s.value === sentiment)?.emoji}
                </span>
                <p className="text-sm text-slate-300">
                  {contextQuestion}
                </p>
              </div>
              <div className="space-y-1.5">
                {contextOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleContext(option)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300",
                      "border border-slate-800 hover:border-indigo-500/30",
                      "hover:bg-indigo-500/5 hover:text-slate-100 transition-all"
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Open text */}
          {step === "open" && (
            <div className="p-4 space-y-3">
              <p className="text-sm text-slate-300">
                Anything specific you would like to tell us?{" "}
                <span className="text-slate-600">(optional)</span>
              </p>
              <Textarea
                value={openText}
                onChange={(e) => setOpenText(e.target.value)}
                placeholder="Your feedback goes directly to the founders."
                rows={3}
                className="bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-600 text-sm resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-slate-500 hover:text-slate-300 text-xs"
                >
                  Skip
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isSubmitting ? "Sending..." : "Send Feedback"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 — Done */}
          {step === "done" && (
            <div className="p-6 flex flex-col items-center text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p
                  className="text-sm font-semibold text-slate-100"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  Thank you.
                </p>
                <p className="text-xs text-slate-500">
                  This genuinely helps us improve. We read every
                  response.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                Close
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}