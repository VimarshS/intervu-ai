import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BrainCircuit,
  MessageSquare,
  FileText,
  Code2,
  Trophy,
  TrendingUp,
  Mic,
  Target,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "AI Mock Interviews",
    description:
      "Practice with an AI interviewer that adapts to your role, company, and experience level. Get realistic questions and intelligent follow-ups.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Upload your resume and get instant AI feedback — ATS score, skill gaps, and predicted interview questions tailored to your profile.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Code2,
    title: "Coding Practice",
    description:
      "Solve coding problems in a real browser IDE with AI-powered hints, complexity analysis, and code review after submission.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track your scores across sessions with visual charts, skill radar, and improvement trends to measure your growth over time.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Mic,
    title: "Voice Interview Mode",
    description:
      "Practice speaking your answers out loud. The AI listens, transcribes, and evaluates your verbal communication skills.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: Target,
    title: "Company-Specific Prep",
    description:
      "Target your preparation to specific companies. The AI tailors questions to match known interview styles at top tech firms.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

const stats = [
  { value: "5+", label: "Interview Types" },
  { value: "AI", label: "Powered Feedback" },
  { value: "100%", label: "Free to Start" },
  { value: "24/7", label: "Available" },
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    description:
      "Sign up and tell us your target role, company, and experience level.",
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Intervu AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center space-y-6">
        <Badge variant="secondary" className="text-xs px-3 py-1">
          🎓 Built for students and job seekers
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
          Ace Every Interview with
          <span className="text-primary"> AI-Powered </span>
          Practice
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
          Practice mock interviews, get instant AI feedback, analyze
          your resume, and track your progress — all in one platform
          built for serious interview preparation.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button asChild size="lg" className="gap-2">
            <Link href="/signup">
              Start Practicing Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          No credit card required · Free forever plan available
        </p>
      </section>

      {/* Stats Row */}
      <section className="border-y bg-muted/50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">
            Everything you need to prepare
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete interview preparation platform powered by
            cutting-edge AI — from mock interviews to resume analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}
                  >
                    <Icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-base">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 border-y">
        <div className="max-w-6xl mx-auto px-6 py-20 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="text-muted-foreground">
              Get interview-ready in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.step} className="relative">
                <Card className="h-full">
                  <CardContent className="pt-6 space-y-3">
                    <span className="text-4xl font-bold text-primary/20">
                      {step.step}
                    </span>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold">
            Why Intervu AI stands out
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {[
            "AI that asks follow-up questions like a real interviewer",
            "Feedback scored across 4 dimensions — not just pass/fail",
            "Resume analysis with predicted interview questions",
            "Company-specific question tailoring for top tech firms",
            "Voice interview mode for communication practice",
            "Progress tracking with visual charts and skill radar",
            "Behavioral, technical, coding, and system design rounds",
            "100% free — no subscription needed to get started",
          ].map((point) => (
            <div key={point} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
          <div className="flex justify-center">
            <Star className="h-10 w-10 opacity-80" />
          </div>
          <h2 className="text-3xl font-bold">
            Ready to ace your next interview?
          </h2>
          <p className="opacity-80 max-w-md mx-auto">
            Join thousands of students and job seekers who are
            preparing smarter with AI-powered mock interviews.
          </p>
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="gap-2"
          >
            <Link href="/signup">
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="h-5 w-5 text-primary" />
            <span className="font-semibold">Intervu AI</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Built as a Final Year Project · AI-Powered Interview
            Practice Platform
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/login" className="hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}