import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  MessageSquare,
  FileText,
  Code2,
  TrendingUp,
  Mic,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Tell us your target",
    description:
      "Set your role, target company, and experience level. Takes 2 minutes.",
  },
  {
    step: "02",
    title: "Practice with AI",
    description:
      "The AI interviews you with real follow-up questions — just like a human interviewer would.",
  },
  {
    step: "03",
    title: "Get your scorecard",
    description:
      "Receive a detailed report on what you did well and exactly what to fix before your real interview.",
  },
];

const features = [
  {
    icon: MessageSquare,
    title: "Practice with an interviewer that never judges you",
    description:
      "Behavioral, technical, system design, or mixed rounds. The AI adapts to your role and experience level.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: FileText,
    title: "Find out why your resume isn't getting callbacks",
    description:
      "Upload your resume and get an ATS score, skill gaps, and the 5 questions you will likely be asked about it.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Code2,
    title: "Solve coding problems with an AI that explains what you missed",
    description:
      "LeetCode-style problems generated for your role. Run your code, get complexity analysis and code review.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: Mic,
    title: "Practice saying your answers out loud",
    description:
      "Voice mode lets you speak your answers. The AI listens, transcribes, and counts filler words like 'um' and 'uh'.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: TrendingUp,
    title: "See yourself getting better, session by session",
    description:
      "Track your scores across every session with charts and a skill radar. Know when you are ready.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const personas = [
  {
    situation: "Placement season is in 3 weeks",
    description:
      "You have done the theory but never practiced answering out loud under pressure. Start with a behavioral interview today — it takes 10 minutes.",
    cta: "Start a behavioral interview →",
    href: "/signup",
  },
  {
    situation: "You applied to 20 companies and heard nothing back",
    description:
      "Upload your resume and find out what is missing before you apply to the next 20. Get an ATS score and predicted interview questions.",
    cta: "Analyze your resume →",
    href: "/signup",
  },
  {
    situation: "You freeze in technical rounds",
    description:
      "Practice coding problems with an AI that asks you to explain your approach — just like a real interviewer. Get feedback on your logic, not just your code.",
    cta: "Practice a coding round →",
    href: "/signup",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Nav */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-indigo-400" />
            </div>
            <span
              className="text-base font-semibold text-slate-100"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Intervu AI
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0"
            >
              <Link href="/signup">Start Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="relative space-y-6">
          {/* Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          <Badge
            variant="outline"
            className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium"
          >
            Free for placement season
          </Badge>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Practice interviews until
            <br />
            <span className="text-indigo-400">
              you stop being nervous.
            </span>
          </h1>

          <p className="text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Intervu AI gives you a realistic AI interviewer that asks
            follow-up questions, scores your answers, and tells you
            exactly what to improve — before your real interview.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 h-12 px-8 text-base w-full sm:w-auto"
            >
              <Link href="/signup">
                Practice Your First Interview Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="text-slate-400 hover:text-slate-200 h-12 w-full sm:w-auto"
            >
              <Link href="/login">Already have an account</Link>
            </Button>
          </div>

          <p className="text-xs text-slate-600">
            No credit card · No setup · Ready in 2 minutes
          </p>
        </div>
      </section>

      {/* How It Works — moved up */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
          <div className="text-center space-y-2">
            <h2
              className="text-2xl font-bold text-slate-50"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              How it works
            </h2>
            <p className="text-slate-500 text-sm">
              From signup to your first feedback report in under 15
              minutes
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3 h-full">
                  <span
                    className="text-4xl font-bold text-indigo-500/20"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {step.step}
                  </span>
                  <h3
                    className="font-semibold text-slate-100"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden sm:flex absolute top-1/2 -right-2.5 z-10 items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For — new section */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center space-y-2">
          <h2
            className="text-2xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Sound familiar?
          </h2>
          <p className="text-slate-500 text-sm">
            Intervu AI is built for exactly these situations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <div
              key={persona.situation}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3 hover:border-indigo-500/30 transition-colors"
            >
              <p
                className="font-semibold text-slate-100 text-sm"
                style={{ fontFamily: "var(--font-space-grotesk)" }}
              >
                &ldquo;{persona.situation}&rdquo;
              </p>
              <p className="text-sm text-slate-400 leading-relaxed">
                {persona.description}
              </p>
              <Link
                href={persona.href}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                {persona.cta}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800 bg-slate-900/20">
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
          <div className="text-center space-y-2">
            <h2
              className="text-2xl font-bold text-slate-50"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              Everything you need to prepare
            </h2>
            <p className="text-slate-500 text-sm">
              Five modules. One platform. All free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`rounded-xl border ${feature.border} bg-slate-900 p-5 space-y-3 hover:bg-slate-800/80 transition-colors`}
                >
                  <div
                    className={`h-9 w-9 rounded-lg ${feature.bg} flex items-center justify-center`}
                  >
                    <Icon className={`h-4 w-4 ${feature.color}`} />
                  </div>
                  <h3
                    className="font-semibold text-slate-100 text-sm leading-snug"
                    style={{ fontFamily: "var(--font-space-grotesk)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Simple trust row */}
      <section className="border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { value: "5", label: "Interview types" },
              { value: "60+", label: "Languages supported" },
              { value: "AI", label: "Powered feedback" },
              { value: "Free", label: "No credit card" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <p
                  className="text-2xl font-bold text-indigo-400"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {item.value}
                </p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2
            className="text-2xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            What makes this different
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
          {[
            "AI asks follow-up questions — not just a question bank",
            "Feedback on communication, not just correctness",
            "Resume analysis that predicts your interview questions",
            "Voice mode with filler word detection",
            "Company-specific question style (Google, Amazon, etc.)",
            "Coding review that explains what you missed, not just pass/fail",
            "Every session scored across 4 dimensions",
            "Works at 2am before a 9am interview",
          ].map((point) => (
            <div
              key={point}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-300">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
          <h2
            className="text-3xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Your interview is coming.
            <br />
            <span className="text-indigo-400">
              Practice before it does.
            </span>
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Free to use. No setup. Your first feedback report in
            under 15 minutes.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 h-12 px-8 text-base"
          >
            <Link href="/signup">
              Practice Your First Interview Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-indigo-500/20 flex items-center justify-center">
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">
              Intervu AI
            </span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            Made for placement season · 2025
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-slate-300 transition-colors">
              Sign Up Free
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}