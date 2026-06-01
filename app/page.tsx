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
  Target,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Mock Interviews",
    description:
      "Practice with an AI that adapts to your role, company, and level. Get realistic questions with intelligent follow-ups.",
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Upload your resume and get instant AI feedback — ATS score, skill gaps, and predicted interview questions.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Code2,
    title: "Coding Practice",
    description:
      "Solve AI-generated coding problems in a real IDE. Get complexity analysis and AI code review after submission.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track scores across sessions with visual charts and a skill radar. Measure your growth over time.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Mic,
    title: "Voice Interview Mode",
    description:
      "Practice speaking your answers out loud. The AI listens, transcribes, and detects filler words.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  {
    icon: Target,
    title: "Company-Specific Prep",
    description:
      "Target preparation to specific companies. The AI tailors questions to match known interview styles.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    description:
      "Set your target role, company, and experience level for a personalized experience.",
  },
  {
    step: "02",
    title: "Start a mock interview",
    description:
      "Choose your interview type and begin a realistic AI-powered session.",
  },
  {
    step: "03",
    title: "Get detailed feedback",
    description:
      "Receive scored feedback across technical, communication, and problem-solving dimensions.",
  },
  {
    step: "04",
    title: "Track and improve",
    description:
      "Monitor your progress with charts and keep practicing until you are ready.",
  },
];

const differentiators = [
  "AI that asks follow-up questions like a real interviewer",
  "Feedback scored across 4 dimensions — not just pass/fail",
  "Resume analysis with predicted interview questions",
  "Company-specific tailoring for top tech firms",
  "Voice interview mode with filler word detection",
  "Progress tracking with visual charts and skill radar",
  "Behavioral, technical, coding, and system design rounds",
  "100% free — no subscription needed to get started",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
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
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Subtle background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative space-y-6">
          <Badge
            variant="outline"
            className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium"
          >
            <Sparkles className="h-3 w-3 mr-1.5" />
            AI-Powered Interview Practice Platform
          </Badge>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 leading-tight tracking-tight"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Ace Every Interview
            <br />
            <span className="text-indigo-400">with AI Practice</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Practice mock interviews, get instant AI feedback, analyze
            your resume, and track your progress — all in one platform
            built for serious interview preparation.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 h-11 px-6"
            >
              <Link href="/signup">
                Start Practicing Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-100 h-11 px-6"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <p className="text-xs text-slate-600">
            No credit card required · Free forever plan available
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "5+", label: "Interview Types" },
              { value: "AI", label: "Powered Feedback" },
              { value: "100%", label: "Free to Start" },
              { value: "24/7", label: "Available" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p
                  className="text-3xl font-bold text-indigo-400"
                  style={{ fontFamily: "var(--font-space-grotesk)" }}
                >
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-3">
          <h2
            className="text-3xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Everything you need to prepare
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            A complete interview preparation platform powered by
            cutting-edge AI.
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
                  <Icon className={`h-4.5 w-4.5 ${feature.color}`} />
                </div>
                <h3
                  className="font-semibold text-slate-100"
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
      </section>

      {/* How It Works */}
      <section className="border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
          <div className="text-center space-y-3">
            <h2
              className="text-3xl font-bold text-slate-50"
              style={{ fontFamily: "var(--font-space-grotesk)" }}
            >
              How it works
            </h2>
            <p className="text-slate-400">
              Get interview-ready in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="hidden lg:flex absolute top-1/2 -right-2.5 z-10 items-center justify-center">
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <div className="text-center">
          <h2
            className="text-3xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Why Intervu AI stands out
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
          {differentiators.map((point) => (
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

      {/* CTA */}
      <section className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/20 mx-auto">
            <BrainCircuit className="h-6 w-6 text-indigo-400" />
          </div>
          <h2
            className="text-3xl font-bold text-slate-50"
            style={{ fontFamily: "var(--font-space-grotesk)" }}
          >
            Ready to ace your next interview?
          </h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Join students and job seekers preparing smarter with
            AI-powered mock interviews.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 gap-2 h-11 px-8"
          >
            <Link href="/signup">
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-indigo-500/20 flex items-center justify-center">
              <BrainCircuit className="h-3.5 w-3.5 text-indigo-400" />
            </div>
            <span className="text-sm font-medium text-slate-400">
              Intervu AI
            </span>
          </div>
          <p className="text-xs text-slate-600 text-center">
            Built as a Final Year Project · AI-Powered Interview
            Practice Platform
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <Link
              href="/login"
              className="hover:text-slate-300 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hover:text-slate-300 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}